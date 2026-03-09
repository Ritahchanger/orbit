const blogService = require("./blogs.service");

class BlogController {
  // Create a new blog
  async createBlog(req, res) {
    const blogData = {
      ...req.body,
      author: req.body.author || "AMPALAX LIMITED",
    };

    const blog = await blogService.createBlog(blogData);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  }

  // Get all blogs
  async getAllBlogs(req, res) {
    const { category, status, featured, page, limit, sortBy } = req.query;

    const result = await blogService.getAllBlogs({
      category,
      status,
      featured: featured === "true",
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 30,
      sortBy: sortBy || "-date",
    });

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: result,
    });
  }

  // Get blog by ID
  async getBlogById(req, res) {
    const { id } = req.params;
    const blog = await blogService.getBlogById(id);

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  }

  // Get blog by slug
  async getBlogBySlug(req, res) {
    const { slug } = req.params;

    // Increment views when fetching by slug
    await blogService.incrementViews(slug);
    const blog = await blogService.getBlogBySlug(slug);

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  }

  // Get blogs by category
  async getBlogsByCategory(req, res) {
    const { category } = req.params;
    const { page, limit } = req.query;

    const result = await blogService.getBlogsByCategory(category, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    res.status(200).json({
      success: true,
      message: `Blogs in category '${category}' fetched successfully`,
      data: result,
    });
  }

  // Get blogs by status
  async getBlogsByStatus(req, res) {
    const { status } = req.params;
    const { page, limit } = req.query;

    // Validate status
    const validStatuses = ["draft", "published", "scheduled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: draft, published, scheduled",
      });
    }

    const result = await blogService.getBlogsByStatus(status, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    res.status(200).json({
      success: true,
      message: `Blogs with status '${status}' fetched successfully`,
      data: result,
    });
  }

  // Update blog
  async updateBlog(req, res) {
    const { id } = req.params;
    const blog = await blogService.updateBlog(id, req.body);

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  }

  // Delete blog
  async deleteBlog(req, res) {
    const { id } = req.params;
    await blogService.deleteBlog(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  }

  // Toggle like
  async toggleLike(req, res) {
    const { id } = req.params;
    // In a real application, you might use user ID, IP address, or browser fingerprint
    const userIdentifier = req.user?.id || req.ip || req.headers["user-agent"];

    const result = await blogService.toggleLike(id, userIdentifier);

    res.status(200).json({
      success: true,
      message: result.liked
        ? "Blog liked successfully"
        : "Blog unliked successfully",
      data: result,
    });
  }

  // Get featured blogs
  async getFeaturedBlogs(req, res) {
    const { limit } = req.query;
    const blogs = await blogService.getFeaturedBlogs(parseInt(limit) || 5);

    res.status(200).json({
      success: true,
      message: "Featured blogs fetched successfully",
      data: blogs,
    });
  }

  // Get blog statistics
  async getBlogStats(req, res) {
    const stats = await blogService.getBlogStats();

    res.status(200).json({
      success: true,
      message: "Blog statistics fetched successfully",
      data: stats,
    });
  }
}

module.exports = new BlogController();
