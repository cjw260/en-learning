<template>
    <Teleport to="body">
        <Transition name="pay-fade">
            <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <!-- 遮罩 -->
                <div class="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" aria-hidden="true" />

                <!-- 弹框 -->
                <div class="relative w-full max-w-md rounded-2xl bg-white shadow-xl shadow-indigo-500/10 border border-zinc-100 overflow-hidden"
                    role="dialog" aria-modal="true" aria-labelledby="pay-dialog-title">
                    <!-- 标题 -->
                    <div class="px-6 pt-6 pb-4 border-b border-zinc-100">
                        <h2 id="pay-dialog-title" class="text-lg font-semibold text-zinc-900">确认支付</h2>
                        <p class="mt-1 text-sm text-zinc-500">请核对课程信息后完成支付</p>
                    </div>
                    <!-- 课程信息（有 course 时展示） -->
                    <div v-if="course" class="p-6 space-y-4">
                        <div class="flex gap-4 rounded-xl bg-zinc-50/80 p-4">
                            <div class="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-zinc-200">
                                <img :src="imageSrc(course.url)" :alt="course.name"
                                    loading="lazy" decoding="async"
                                    class="w-full h-full object-cover" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <h3 class="text-sm font-medium text-zinc-900 line-clamp-2">{{ course.name }}</h3>
                                <p class="mt-1 text-xs text-zinc-500">讲师 {{ course.teacher }}</p>
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-between rounded-xl border border-zinc-100 bg-indigo-50/50 px-4 py-3">
                            <span class="text-sm text-zinc-600">支付金额</span>
                            <span class="text-xl font-bold text-indigo-600">¥{{ course.price }}</span>
                        </div>
                        <!-- 沙箱测试账号 -->
                        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 space-y-1">
                            <p class="font-medium">🧪 支付宝沙箱测试账号</p>
                            <p>账号：rfkler1090@sandbox.com</p>
                            <p>登录密码 & 支付密码：111111</p>
                        </div>
                        <!-- 支付剩余时间倒计时（创建订单后显示） -->
                        <div v-if="timeExpire > 0"
                            class="flex flex-col items-center rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                            <el-countdown title="支付剩余时间" format="HH:mm:ss" :value="timeExpire" @finish="tips" />
                        </div>
                    </div>

                    <!-- 无数据时的占位 -->
                    <div v-else class="p-6 text-center text-sm text-zinc-400">
                        暂无课程信息
                    </div>

                    <!-- 底部按钮 -->
                    <div class="flex gap-3 px-6 pb-6 pt-2">
                        <button type="button"
                            class="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
                            @click="close">
                            取消
                        </button>
                        <button type="button"
                            class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="isPay" @click="onConfirm">
                            {{ isPay ? '支付中...' : '确认支付' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>


<script setup lang="ts">
import { uploadUrl } from '@/apis';
import type { Course } from '@en/common/course';
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';
import type {CreatePayDto} from '@en/common/pay';
const { getSocket } =  useSocket();
import {createPay} from '@/apis/pay'; 
import { useSocket } from '@/hooks/userSocket';
const modelValue = defineModel<boolean>('modelValue',{required: true});
const props = defineProps<{
    course: Course | null,
}>()
const isPay = ref(false);//是否支付中
const timeExpire = ref(0);//支付剩余时间

watch(modelValue, (newVal) => {
    const socket = getSocket();
    if(newVal){
        socket?.on('paymentSuccess', () => {
            ElMessage.success({
                message: '支付成功',
                duration: 1000,//10秒后关闭
            });
            close();
        })
    } else {
        socket?.off('paymentSuccess');
    }
})

//图片地址
const imageSrc = (url: string) => {
    return uploadUrl + url;
}
//支付超时
const tips = () => {
    ElMessage.error('支付超时');
    timeExpire.value = 0;
    isPay.value = false;
}
//关闭弹框
const close = () => {
    modelValue.value = false;//关闭弹框
    timeExpire.value = 0;//重置支付剩余时间
    isPay.value = false;//重置支付状态
}

//点击确认支付  
const onConfirm = async () => {
    const body: CreatePayDto = {
        subject: props.course?.name || '',
        body: props.course?.description || '',
        total_amount: props.course?.price || '',
        courseId: props.course?.id || ''
    }
    const res  = await createPay(body);
    if(res.code === 200){
        isPay.value = true;//设置支付中
        window.open(res.data.payUrl, '_blank')
        timeExpire.value = res.data.timeExpire;
    }else{
        ElMessage.error(res.message);
        isPay.value = false;//设置支付中
    }
    
    console.log('支付');
}
</script>

<style scoped>
.pay-fade-enter-active,
.pay-fade-leave-active {
    transition: opacity 0.2s ease;
}

.pay-fade-enter-from,
.pay-fade-leave-to {
    opacity: 0;
}
</style>