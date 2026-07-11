export default [
    {
        path: '/courses',
        component: () => import('@/layout/index.vue'),
        children: [
            { path: 'index', component: () => import('@/views/Course/index.vue'), },
            {
                path: 'learn/:courseId/:title',
                component: () => import('@/views/Course/Learn/index.vue')
            }
        ]
    }
]