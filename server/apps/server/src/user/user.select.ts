export const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  wordNumber: true,
  dayNumber: true,
  bio: true, //签名 第七集新增
  isTimingTask: true, //是否开启定时任务 第七集新增
  timingTaskTime: true, //定时任务时间 第七集新增
};

export const updateUserSelect = {
  name: true, //用户名
  email: true, //邮箱
  address: true, //地址
  avatar: true, //头像
  bio: true, //签名 第七集新增
  isTimingTask: true, //是否开启定时任务 第七集新增
  timingTaskTime: true, //定时任务时间 第七集新增
};
