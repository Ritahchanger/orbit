const mongoose = require("mongoose");

const commentSchema = require("./comment.model");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Automation",
        "Solar",
        "Safety",
        "Innovation",
        "Electrical",
        "Sustainability",
        "Software-engineering",

      ],
      default: "Automation",
    },
    tags: {
      type: [String],
      validate: [(tags) => tags.length <= 6, "Maximum of 6 tags allowed"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    author: {
      type: String,
      required: true,
      default: "Electro Green Energy",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    readTime: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
    likes: {
      type: Number,
      default: 0,
    },
    likesBy: [
      {
        type: String, // Store IP addresses or browser fingerprints for anonymous users
        trim: true,
      },
    ],
    slug: {
      type: String,
      unique:true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for approved comment count
blogSchema.virtual("approvedComments").get(function () {
  return this.comments.filter((comment) => comment.isApproved);
});

blogSchema.virtual("approvedCommentCount").get(function () {
  return this.comments.filter((comment) => comment.isApproved).length;
});

// Pre-save middleware
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  if (this.isModified("content")) {
    const text = this.content.replace(/<[^>]*>/g, "");
    const wordCount = text
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    this.readTime = `${Math.ceil(wordCount / 200)} min read`;
  }

  next();
});

module.exports = mongoose.model("Blog", blogSchema);
