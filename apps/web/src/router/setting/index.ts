export default [
    {
        path: '/setting',
        component: () => import('@/layout/index.vue'),
        children: [
            { path: 'index', component: () => import('@/views/Setting/index.vue'), }
        ]
    }
]