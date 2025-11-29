module.exports = {
  apps: [
    {
      name: 'aa-backend',
      script: 'run_server.py',
      cwd: '/home/ubuntu/architecture-academics-portal/backend',
      interpreter: '/home/ubuntu/architecture-academics-portal/backend/.venv/bin/python',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        // Backend environment variables - EDIT THESE!
        AWS_ACCESS_KEY_ID: 'your_aws_access_key_here',
        AWS_SECRET_ACCESS_KEY: 'your_aws_secret_key_here',
        AWS_REGION: 'us-east-1',
        S3_BUCKET_NAME: 'architecture-academics-videos',
        DATABASE_URL: 'sqlite:///./architecture_academics.db',
        SECRET_KEY: 'your-production-secret-key-here-use-strong-random-string',
        ALGORITHM: 'HS256',
        ACCESS_TOKEN_EXPIRE_MINUTES: '30',
        CORS_ORIGINS: '["http://15.206.47.135","https://15.206.47.135"]',
        // Email settings
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_USER: 'your-email@gmail.com',
        SMTP_PASSWORD: 'your-app-password',
        FRONTEND_URL: 'http://15.206.47.135'
      }
    },
    {
      name: 'aa-frontend',
      script: 'pnpm',
      args: 'start',
      cwd: '/home/ubuntu/architecture-academics-portal/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        // Frontend must have these set BEFORE BUILD!
        NEXT_PUBLIC_API_URL: 'http://15.206.47.135/api',
        NEXT_PUBLIC_SITE_URL: 'http://15.206.47.135'
      }
    }
  ]
};
