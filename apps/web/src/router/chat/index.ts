import layout from '@/layout/index.vue'
export default [
    {
        path: '/chat',
        component: layout,
        children: [
            { path: 'index', component: () => import('@/views/Chat/index.vue'), }
        ]
    }
]