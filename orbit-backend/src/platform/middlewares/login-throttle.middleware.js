// middlewares/login-throttle.middleware.js
// Slows down password guessing on the platform login: after MAX_FAILURES
// failed attempts from one IP for one email, further attempts are refused
// until the window passes. In-memory, so it resets on restart and is per
// process — enough for a single admin login, not a general rate limiter.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

const failures = new Map(); // key -> { count, firstAt }

const keyFor = (req) =>
  `${req.ip}|${String(req.body?.email || "").toLowerCase().trim()}`;

const isLocked = (key) => {
  const entry = failures.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
};

const loginThrottle = (req, res, next) => {
  const key = keyFor(req);
  if (isLocked(key)) {
    return res.status(429).json({
      success: false,
      message: "Too many failed attempts. Try again in 15 minutes.",
    });
  }

  req.recordLoginFailure = () => {
    const entry = failures.get(key);
    if (entry) entry.count += 1;
    else failures.set(key, { count: 1, firstAt: Date.now() });
  };
  req.clearLoginFailures = () => failures.delete(key);
  next();
};

module.exports = loginThrottle;
