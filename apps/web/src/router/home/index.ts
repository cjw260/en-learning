export default [
    {
        path: '/',
        component: () => import('@/layout/index.vue'),
        children: [
            { path: '/', component: () => import('@/views/Home/index.vue'), }
        ]
    }
]