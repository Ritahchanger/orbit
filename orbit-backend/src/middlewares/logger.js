// middlewares/logger.js

const logger = (req, res, next) => {
  const start = Date.now();

  const formatTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Color helper
  const color = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    gray: "\x1b[90m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
  };

  const getStatusColor = (status) => {
    if (status >= 500) return color.red;
    if (status >= 400) return color.yellow;
    if (status >= 300) return color.yellow;
    return color.green;
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `${color.gray}[${formatTime()}]${color.reset} ` +
        `${color.cyan}${req.method}${color.reset} ` +
        `${color.magenta}${req.originalUrl}${color.reset} | ` +
        `Status: ${statusColor}${res.statusCode}${color.reset} | ` +
        `${color.gray}Time: ${duration}ms | IP: ${req.ip}${color.reset}`
    );
  });

  next();
};

module.exports = logger;
