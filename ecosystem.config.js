module.exports = {
  apps: [
    {
      name: 'aa-backend',
      script: 'run_server.py',
      cwd: '/home/ec2-user/architecture-academics-portal/backend',
      interpreter: '/home/ec2-user/architecture-academics-portal/backend/.venv/bin/python',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '/home/ec2-user/architecture-academics-portal/backend/.env',
      error_file: '/home/ec2-user/architecture-academics-portal/logs/backend-error.log',
      out_file: '/home/ec2-user/architecture-academics-portal/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'aa-frontend',
      script: 'pnpm',
      args: 'start',
      cwd: '/home/ec2-user/architecture-academics-portal/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      error_file: '/home/ec2-user/architecture-academics-portal/logs/frontend-error.log',
      out_file: '/home/ec2-user/architecture-academics-portal/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
