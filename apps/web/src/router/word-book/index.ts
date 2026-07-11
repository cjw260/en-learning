export default [
    {
        path: '/word-book',
        component: () => import('@/layout/index.vue'),
        children: [
            { path: 'index', component: () => import('@/views/WordBook/index.vue'), }
        ]
    }
]