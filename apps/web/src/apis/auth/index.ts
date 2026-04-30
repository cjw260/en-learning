import axios from 'axios'
import type { Token } from '@en/common/user'
import type { Response } from '../index'
const refreshServer = axios.create({
    baseURL: '/api/v1',
    timeout: 50000,
})

//响应拦截器
refreshServer.interceptors.response.use(res => {
    return res.data
}, error => {
    return Promise.reject(error)
})

//导出刷新token的接口了
export const refreshTokenApi = (data: Omit<Token, 'accessToken'>) => refreshServer.post('/user/refresh-token', data) as Promise<Response<Token>>

//为什么要分开 隔离起来 防止死循环
//隔离起来 这个接口是不会携带token的 因为我们携带token是在serverApi携带token
//安全策略