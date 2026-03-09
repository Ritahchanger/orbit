const commentService = require("./comment.service");

const Blog = require("./blogs.model");

/**
 * @desc    Add a comment to a blog
 * @route   POST /api/blogs/:blogId/comments
 * @access  Public
 */
const addComment = async (req, res) => {
  const { blogId } = req.params;

  const commentData = req.body;

  const result = await commentService.addComment(blogId, commentData);

  res.status(201).json({
    success: true,
    data: result,
    message: result.message,
  });
};

/**
 * @desc    Add multiple comments to a blog
 * @route   POST /api/blogs/:blogId/comments/bulk
 * @access  Public (Consider making this private for admin use)
 */
const addMultipleComments = async (req, res) => {
  const { blogId } = req.params;
  const { comments } = req.body;

  if (!comments || !Array.isArray(comments)) {
    return res.status(400).json({
      success: false,
      message: "Comments array is required",
    });
  }

  const result = await commentService.addMultipleComments(blogId, comments);

  res.status(201).json({
    success: true,
    data: result,
    message: result.message,
  });
};

/**
 * @desc    Add a comment with auto-approval logic
 * @route   POST /api/blogs/:blogId/comments/auto-approve
 * @access  Public
 */
const addCommentWithAutoApproval = async (req, res) => {
  const { blogId } = req.params;
  const commentData = req.body;

  console.log(req.body)

  const result = await commentService.addCommentWithAutoApproval(
    blogId,
    commentData
  );

  res.status(201).json({
    success: true,
    data: result,
    message: result.message,
  });
};

/**
 * @desc    Get all comments for a blog
 * @route   GET /api/blogs/:blogId/comments
 * @access  Public
 */
const getBlogComments = async (req, res) => {
  const { blogId } = req.params;
  const { approvedOnly = "true" } = req.query;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  let comments = blog.comments;

  // Filter approved comments only if requested
  if (approvedOnly === "true") {
    comments = comments.filter((comment) => comment.isApproved);
  }

  // Sort by latest first
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({
    success: true,
    data: {
      comments,
      count: comments.length,
      blogTitle: blog.title,
    },
    message: `Retrieved ${comments.length} comments successfully`,
  });
};

/**
 * @desc    Get a specific comment
 * @route   GET /api/blogs/:blogId/comments/:commentId
 * @access  Public
 */
const getComment = async (req, res) => {
  const { blogId, commentId } = req.params;

  const blog = await Blog.findOne({
    _id: blogId,
    "comments._id": commentId,
  });

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  const comment = blog.comments.id(commentId);

  res.status(200).json({
    success: true,
    data: { comment },
    message: "Comment retrieved successfully",
  });
};

/**
 * @desc    Approve a comment
 * @route   PATCH /api/blogs/:blogId/comments/:commentId/approve
 * @access  Private/Admin
 */
const approveComment = async (req, res) => {
  const { blogId, commentId } = req.params;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  const comment = blog.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  comment.isApproved = true;
  await blog.save();

  res.status(200).json({
    success: true,
    data: { comment },
    message: "Comment approved successfully",
  });
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/blogs/:blogId/comments/:commentId
 * @access  Private/Admin
 */
const deleteComment = async (req, res) => {
  const { blogId, commentId } = req.params;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  const comment = blog.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  comment.remove();
  await blog.save();

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
};

/**
 * @desc    Get comment statistics for a blog
 * @route   GET /api/blogs/:blogId/comments/stats
 * @access  Private/Admin
 */
const getCommentStats = async (req, res) => {
  const { blogId } = req.params;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  const totalComments = blog.comments.length;
  const approvedComments = blog.comments.filter(
    (comment) => comment.isApproved
  ).length;
  const pendingComments = totalComments - approvedComments;

  res.status(200).json({
    success: true,
    data: {
      totalComments,
      approvedComments,
      pendingComments,
      approvalRate:
        totalComments > 0
          ? ((approvedComments / totalComments) * 100).toFixed(1)
          : 0,
    },
    message: "Comment statistics retrieved successfully",
  });
};

module.exports = {
  addComment,
  addMultipleComments,
  addCommentWithAutoApproval,
  getBlogComments,
  getComment,
  approveComment,
  deleteComment,
  getCommentStats,
};
