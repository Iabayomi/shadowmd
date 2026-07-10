/**
   * Create By ༒︎ 𝐉𝐀𝐕𝐀 𝐆𝐎𝐃 ༒︎
   * Contact: https://whatsapp.com/channel/0029VbDbApk0bIdjGxfFAr1V
*/
module.exports = {
  apps: [{
    name: "java-god-bot",
    script: "./index.js",
    watch: true,
    ignore_watch: [
      "**/*", 
      "!index.js" 
    ],
    autorestart: true,
    max_memory_restart: "1G",
    node_args: "--max-old-space-size=1024",
    env: {
      NODE_ENV: "production",
      RESTART_COUNT: "0"
    },
    error_file: "./logs/error.log",
    out_file: "./logs/output.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    combine_logs: true,
    time: true,
    restart_delay: 3000,
    max_restarts: 50,
    min_uptime: "5s",
    wait_ready: true,
    listen_timeout: 30000,
    exp_backoff_restart_delay: 100
  }]
};
