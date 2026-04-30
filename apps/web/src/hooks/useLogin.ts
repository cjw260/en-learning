import { IS_SHOW_LOGIN } from '@/components/Login/type'
import { inject,ref } from 'vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'
export const useLogin = () => {
    const isShowLogin = inject(IS_SHOW_LOGIN, ref(false))
    const userStore = useUserStore()
    
    const login = () => {
        return new Promise((resolve,reject) => {
            if(userStore.getUser) {
                resolve(true)
            } else {
                isShowLogin.value = true
                reject(false)
            }
        })
        
    }
    const hide = () => {
        isShowLogin.value = false
    }
    const logout = () => {
        // 清除用户信息
        userStore.logout()
        router.push('/')
    }
    return {
        login,
        hide,
        logout
    }
}
