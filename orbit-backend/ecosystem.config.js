module.exports = {
  apps: [
    {
      name: "ampalax-api",
      script: "./src/server.js",
      instances: 1,
      exec_mode: "fork",
      watch: ["src"],
      ignore_watch: ["node_modules", "logs", "src/workers"],
      watch_options: {
        followSymlinks: false,
      },
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "./logs/api-err.log",
      out_file: "./logs/api-out.log",
      log_file: "./logs/api-combined.log",
      time: true,
    },
    {
      name: "email-worker",
      script: "./src/workers/email.worker.js",
      instances: 2,
      exec_mode: "cluster",
      watch: ["src/workers"],
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "./logs/worker-err.log",
      out_file: "./logs/worker-out.log",
      log_file: "./logs/worker-combined.log",
      time: true,
    },
  ],

  // Deployment configuration (optional - for future use)
  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/main",
      repo: "GIT_REPOSITORY",
      path: "/var/www/ampalax-backend",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
