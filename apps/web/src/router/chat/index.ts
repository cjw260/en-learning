export default [
    {
        path: '/chat',
        component: () => import('@/layout/index.vue'),
        children: [
            { path: 'index', component: () => import('@/views/Chat/index.vue'), }
        ]
    }
]