import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WebResultUser, Token, UserUpdate } from '@en/common/user'
export const useUserStore = defineStore('user', () => {
  const user = ref<WebResultUser | null>(null)//用户信息
  const setUser = (params: WebResultUser) => {
    user.value = params
  }
  //导出accessToken
  const getAccessToken = computed(() => user.value?.token.accessToken)
  //导出refreshToken
  const getRefreshToken = computed(() => user.value?.token.refreshToken)
  //更新token
  const updateToken = (newToken: Token) => {
    user.value!.token = newToken
  }
  //更新用户单词数量
  const updateUserWordNumber = (wordNumber: number) => {
    user.value!.wordNumber = wordNumber
  }
  //点击完成保存之后更新用户信息
  const updateUser = (params: UserUpdate) => {
    user.value!.name = params.name
    user.value!.avatar = params.avatar
    user.value!.email = params.email
    user.value!.bio = params.bio
    user.value!.isTimingTask = params.isTimingTask
    user.value!.timingTaskTime = params.timingTaskTime
    user.value!.address = params.address
  }
  //在设置界面默认读取用户信息
  const getUpdateUserInfo = computed<UserUpdate>(() => {
    return {
      name: user.value!.name,
      avatar: user.value!.avatar,
      email: user.value!.email,
      bio: user.value!.bio,
      isTimingTask: user.value!.isTimingTask,
      timingTaskTime: user.value!.timingTaskTime,
      address: user.value!.address,
    }
  })
  const getUser = computed(() => user.value)//获取用户信息
  const logout = () => {//退出登录
    user.value = null
  }
  return { user,setUser, getUser, logout, getAccessToken, getRefreshToken, updateToken, getUpdateUserInfo, updateUser, updateUserWordNumber }
},{
  persist: true,//开启持久化
})
