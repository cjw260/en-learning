module.exports = {
  apps: [
    {
      name: 'en-server',
      script: 'server/dist/apps/server/apps/server/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'en-ai',
      script: 'server/dist/apps/ai/apps/ai/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
