export interface User {
    id: string; // 用户ID
    name: string; // 用户名
    email?: string |null; // 邮箱
    phone: string; // 手机号
    address?: string |null; // 地址
    password: string; // 密码
    avatar?: string |null; // 头像
    bio?: string |null; // 个人简介
    isTimingTask?: boolean; // 是否开启定时任务
    timingTaskTime?: string ; // 定时任务时间
    wordNumber: number; // 单词数量
    dayNumber: number; // 打卡天数
    createdAt: Date; // 创建时间
    updatedAt: Date; // 更新时间
    lastLoginAt?: Date |null; // 最后登录时间
}

//登录的类型
export type UserLogin = Pick<User, 'phone' | 'password'>
//注册
export type UserRegister = Pick<User, 'name' | 'phone' | 'email' | 'password'>
//返回的类型,不包含密码
export type ResultUser = Omit<User, 'password'>
//更新用户的类型 
export type UserUpdate = Pick<User, 'name' | 'email' | 'address' | 'avatar' | 'bio' | 'isTimingTask' | 'timingTaskTime'>
//头像返回的类型
export type AvatarResult = {
    previewUrl: string // 预览地址
    databaseUrl: string // 数据库地址
}
//token的类型
export type Token = {
    accessToken: string // 访问令牌
    refreshToken: string // 刷新令牌
}
//返回的类型,包含token
export type WebResultUser = ResultUser & {
    token: Token
}
//token的载荷类型
export type TokenPayload = Pick<User,  'name' | 'email' > & { userId: User['id'] }
//刷新令牌的载荷类型
export type RefreshTokenPayload = TokenPayload & { tokenType: 'refresh' | 'access' }