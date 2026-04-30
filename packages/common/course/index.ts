//定义单个课程的接口
export interface Course {
    id: string;//课程ID
    name: string;//课程名称
    value: string;//课程标识 gk
    description?: string;//课程描述
    teacher: string;//授课老师
    url: string;//课程链接
    price: string;//课程价格
}
//定义多个课程的列表
export type CourseList = Course[];