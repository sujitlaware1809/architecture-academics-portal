module.exports = {
  apps: [
    {
      name: 'aa-backend',
      script: 'run_server.py',
      cwd: 'E:\\Projects\\client\\Suresh_Sir_Arch\\backend',
      interpreter: 'E:\\Projects\\client\\Suresh_Sir_Arch\\backend\\winvenv\\Scripts\\python.exe',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 8000
      }
    },
    {
      name: 'aa-frontend',
      script: 'npm.cmd',
      args: 'start',
      cwd: 'E:\\Projects\\client\\Suresh_Sir_Arch\\frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3000
      }
    }
  ]
};
