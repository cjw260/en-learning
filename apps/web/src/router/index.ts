import { createRouter, createWebHistory } from 'vue-router'
import home from './home/index'
import wordBook from './word-book/index'
import setting from './setting/index'
import chat from './chat/index'
import course from './course/index'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home,//主页
    ...wordBook,//单词本
    ...setting,//设置
    ...chat,//聊天
    ...course,//课程
  ],
})

export default router
