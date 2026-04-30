import layout from '@/layout/index.vue'
export default [
    {
        path: '/courses',
        component: layout,
        children: [
            { path: 'index', component: () => import('@/views/Course/index.vue'), },
            {
                path: 'learn/:courseId/:title',
                component: () => import('@/views/Course/Learn/index.vue')
            }
        ]
    }
]