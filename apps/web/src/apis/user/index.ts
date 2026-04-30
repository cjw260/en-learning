import { serverApi, type Response } from "..";
import type { AvatarResult, UserLogin, UserRegister, UserUpdate, WebResultUser } from "@en/common/user";

export const login = (data: UserLogin) => serverApi.post('/user/login', data) as Promise<Response<WebResultUser>>
export const register = (data: UserRegister) => serverApi.post('/user/register', data) as Promise<Response<WebResultUser>>
//上传头像
export const uploadAvatar = (file: FormData) => serverApi.post('/user/upload-avatar', file) as Promise<Response<AvatarResult>>
//更新用户信息
export const updateUser = (data: UserUpdate) => serverApi.post('/user/update-user', data) as Promise<Response<UserUpdate>>