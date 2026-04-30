export interface TrackerConfig {
    userId?: string // 用户ID
    baseUrl: string // 基础URL
    uv:{
        api:string // uv上报接口
        updateApi:string // uv更新UserId接口
    }
    pv:{
        api:string // pv上报接口
    }
    event:{
        api:string // 事件上报接口
    }
    error:{
        api:string // 错误上报接口
    }
    performance:{
        api:string // 性能上报接口
    }
}

export interface PvDto {
    visitorId: string // 访客ID
    url: string // 页面URL
    referrer: string // 来源URL
    path: string // 页面路径
}

export interface UpdateUvDto {
    visitorId: string // 访客ID
    userId: string // 用户ID
}

export interface EventDto {
    visitorId: string // 访客ID
    event: string // 事件类型
    payload: Record<string, any> // 事件数据
    url: string // 页面URL
}

export interface ErrorDto {
    visitorId: string // 访客ID
    error: string // 错误类型
    message: string // 错误信息
    stack: string // 错误堆栈
    url: string // 页面URL
}

export interface PerformanceDto {
    visitorId: string // 访客ID
    fp: number // FP
    fcp: number // FCP
    lcp: number // LCP
    inp: number // INP
    cls: number // CLS
}

export interface UvDto {
    anonymousId: string // 匿名ID
    userId?: string | undefined // 用户ID
    browser: string // 浏览器
    os: string // 操作系统
    device: string // 设备
}