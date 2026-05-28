// PM2 ecosystem file
// Usage: pm2 start deploy/ecosystem.config.cjs
// Docs:  https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'nexprompt-api',
      script: 'src/index.js',
      cwd: '/var/www/nexprompt/server',

      // Node 20+ ESM — no transpile step needed
      interpreter: 'node',
      interpreter_args: '--experimental-vm-modules',

      instances: 1,          // single instance; bump to 'max' only after adding sticky sessions for Socket.IO
      exec_mode: 'fork',     // use 'cluster' only with a Socket.IO Redis adapter

      // Restart policy
      autorestart: true,
      watch: false,          // never watch in production
      max_memory_restart: '512M',

      // Environment — production values loaded from server/.env on the VPS
      // Do NOT put secrets here; keep them in /var/www/nexprompt/server/.env
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Logging
      out_file: '/var/log/pm2/nexprompt-out.log',
      error_file: '/var/log/pm2/nexprompt-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
