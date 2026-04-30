<template>
    <div class="w-[1200px] mx-auto flex mt-10">
        <Conversations @onGetRole="getRole" />
        <Bubble :list="list" @onSendMessage="sendMessage" />
    </div>
</template>
<script setup lang="ts">
import Conversations from './components/Conversations.vue';
import Bubble from './components/Bubble.vue';
import { useUserStore } from '@/stores/user';
import { onMounted, ref } from 'vue';
import { getChatHistory } from '@/apis/chat';
import type { ChatDto, ChatMessage, ChatMessageList, ChatRoleType } from '@en/common/chat';
import { sse, CHAT_URL } from '@/apis/sse';
const role = ref<ChatRoleType>('normal')//存储角色
const userStore = useUserStore()
const userId = userStore.user?.id
const list = ref<ChatMessageList>([])
const getRole = async (params: ChatRoleType) => {
    role.value = params
    const res = await getChatHistory(userId!, params)//获取历史记录
    list.value = res.data//存储历史记录
}
const sendMessage = (message: string,deepThink: boolean,webSearch: boolean) => {
    list.value.push({role: 'human', content: message, type: 'chat'})//添加用户的信息
    list.value.push({role: 'ai', content: '', reasoning:'',type: 'chat'})//添加ai的信息
    sse<ChatMessage, ChatDto>(CHAT_URL, "POST", {role: role.value, content: message, userId: userId!,deepThink,webSearch},//发送请求
        (data) => {
            if(data.type === 'reasoning'){
                list.value[list.value.length - 1]!.reasoning += data.content//更新ai的信息
            }
            if(data.type === 'chat'){
                list.value[list.value.length - 1]!.content += data.content//更新ai的信息
            }
        },
    )
} 

</script>