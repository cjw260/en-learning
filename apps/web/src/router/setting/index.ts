import layout from '@/layout/index.vue'
export default [
    {
        path: '/setting',
        component: layout,
        children: [
            { path: 'index', component: () => import('@/views/Setting/index.vue'), }
        ]
    }
]