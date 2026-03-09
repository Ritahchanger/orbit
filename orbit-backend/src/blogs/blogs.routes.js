const express = require("express");
const router = express.Router();

const blogController = require("./blogs.controller");
const commentController = require("./comment.controller");
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");

// Public blog routes
router.get("/", asyncWrapper(blogController.getAllBlogs));
router.get("/featured", blogController.getFeaturedBlogs);
router.get("/category/:category", blogController.getBlogsByCategory);
router.get("/slug/:slug", blogController.getBlogBySlug);
router.get("/stats", blogController.getBlogStats);

// Protected blog routes
router.post("/", tokenValidator, asyncWrapper(blogController.createBlog));
router.get("/status/:status", asyncWrapper(blogController.getBlogsByStatus));
router.get("/:id", asyncWrapper(blogController.getBlogById));
router.put("/:id", tokenValidator, asyncWrapper(blogController.updateBlog));
router.delete("/:id", tokenValidator, asyncWrapper(blogController.deleteBlog));
router.post("/:id/like", tokenValidator, asyncWrapper(blogController.toggleLike));

// Comment routes
// Public comment routes
router.post("/:blogId/comments", asyncWrapper(commentController.addComment));
router.post("/:blogId/comments/auto-approve", asyncWrapper(commentController.addCommentWithAutoApproval));
router.get("/:blogId/comments", asyncWrapper(commentController.getBlogComments));
router.get("/:blogId/comments/:commentId", asyncWrapper(commentController.getComment));

// Protected comment routes (Admin only)
router.post("/:blogId/comments/bulk", tokenValidator, asyncWrapper(commentController.addMultipleComments));
router.patch("/:blogId/comments/:commentId/approve", tokenValidator, asyncWrapper(commentController.approveComment));
router.delete("/:blogId/comments/:commentId", tokenValidator, asyncWrapper(commentController.deleteComment));
router.get("/:blogId/comments/stats", tokenValidator, asyncWrapper(commentController.getCommentStats));

module.exports = router;