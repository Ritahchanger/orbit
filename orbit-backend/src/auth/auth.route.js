const Router = require("express").Router();

const NormalUserAuthController = require("./normal-authentication/normal-auth.controller");

const GoogleAuthController = require("./google-authentication/google-auth.controller");

const passport = require("passport");

const asyncWrapper = require("../middlewares/asyncMiddleware");

const tokenValidator = require("../middlewares/tokenValidator");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 */
Router.post("/register", asyncWrapper(NormalUserAuthController.signUp));

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: User signed in successfully
 *       401:
 *         description: Invalid credentials
 */
Router.post("/signin", asyncWrapper(NormalUserAuthController.signIn));

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user retrieved successfully
 *       401:
 *         description: Unauthorized
 */
Router.get("/me", tokenValidator, asyncWrapper(NormalUserAuthController.getMe));

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
Router.put(
  "/change-password",
  tokenValidator,
  asyncWrapper(NormalUserAuthController.changePasswordController)
);

/**
 * @swagger
 * /api/v1/auth/login/failed:
 *   get:
 *     summary: Google login failure callback
 *     tags: [Authentication]
 *     responses:
 *       401:
 *         description: Google authentication failed
 */
Router.get("/login/failed", GoogleAuthController.loginFailed);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
Router.post("/logout", GoogleAuthController.logout);

/**
 * @swagger
 * /api/v1/auth/login/success:
 *   get:
 *     summary: Google login success callback
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google authentication successful
 */
Router.get("/login/success", GoogleAuthController.loginSuccess);

/**
 * @swagger
 * /api/v1/auth/store-intended-path:
 *   post:
 *     summary: Store intended redirect path for authentication
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intendedPath:
 *                 type: string
 *                 example: /admin/dashboard
 *     responses:
 *       200:
 *         description: Intended path stored successfully
 */
Router.post("/store-intended-path", (req, res) => {
  if (req.session) {
    req.session.intendedPath = req.body.intendedPath;
    return res.json({ success: true });
  }
  return res.status(400).json({ success: false });
});

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: intendedPath
 *         schema:
 *           type: string
 *         example: /admin
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth
 */
Router.get("/google", (req, res, next) => {
  const intendedPath =
    req.query.intendedPath || req.session?.intendedPath || "/admin";

  if (req.session) {
    req.session.intendedPath = intendedPath;
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: intendedPath,
  })(req, res, next);
});

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect after Google authentication
 */
Router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  GoogleAuthController.googleCallback
);


module.exports = Router;