const Blog = require("./blogs.model");

class BlogService {
  // Create a new blog
  async createBlog(blogData) {
    const blog = new Blog(blogData);
    return await blog.save();
  }

  // Get all blogs with filtering and pagination
  async getAllBlogs({
    category,
    status,
    featured,
    page = 1,
    limit = 10,
    sortBy = "-date",
  } = {}) {
    const query = {};

    // Add filters if provided
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: "comments",
    };

    const blogs = await Blog.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const total = await Blog.countDocuments(query);

    return {
      blogs,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total,
    };
  }

  // Get blog by ID
  async getBlogById(id) {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  }

  // Get blog by slug
  async getBlogBySlug(slug) {
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  }

  // Get blogs by category
  async getBlogsByCategory(category, { page = 1, limit = 10 } = {}) {
    const query = { category, status: "published" };

    const blogs = await Blog.find(query)
      .sort("-date")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Blog.countDocuments(query);

    return {
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      category,
    };
  }

  // Get blogs by status
  async getBlogsByStatus(status, { page = 1, limit = 10 } = {}) {
    const query = { status };

    const blogs = await Blog.find(query)
      .sort("-date")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Blog.countDocuments(query);

    return {
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      status,
    };
  }

  // Update blog
  async updateBlog(id, updateData) {
    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  }

  // Delete blog
  async deleteBlog(id) {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  }

  // Increment views
  async incrementViews(id) {
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  }

  // Toggle like
  async toggleLike(blogId, userIdentifier) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }

    const hasLiked = blog.likesBy.includes(userIdentifier);

    if (hasLiked) {
      // Unlike
      blog.likesBy = blog.likesBy.filter((id) => id !== userIdentifier);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      // Like
      blog.likesBy.push(userIdentifier);
      blog.likes += 1;
    }

    await blog.save();
    return {
      blog,
      liked: !hasLiked,
      likes: blog.likes,
    };
  }

  // Get featured blogs
  async getFeaturedBlogs(limit = 5) {
    return await Blog.find({ featured: true, status: "published" })
      .sort("-date")
      .limit(limit);
  }

  // Get blog statistics
  async getBlogStats() {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: "published" });
    const draftBlogs = await Blog.countDocuments({ status: "draft" });
    const scheduledBlogs = await Blog.countDocuments({ status: "scheduled" });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalLikes = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]);

    return {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      scheduledBlogs,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
    };
  }
}

module.exports = new BlogService();
