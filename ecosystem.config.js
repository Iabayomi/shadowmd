module.exports = {
  apps: [{
    name: "java-god-bot",
    script: "./index.js",
    watch: false, // Disabling watch to prevent unnecessary restarts during file updates
    autorestart: true,
    max_memory_restart: "1G",
    node_args: "--max-old-space-size=1024",
    env: {
      NODE_ENV: "production",
    },
    error_file: "./logs/error.log",
    out_file: "./logs/output.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    restart_delay: 5000,
    max_restarts: 100,
    min_uptime: "10s",
    exp_backoff_restart_delay: 100
  }]
};
