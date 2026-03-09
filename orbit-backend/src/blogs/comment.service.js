const Blog = require("./blogs.model");

class CommentService {
  async addComment(blogId, commentData) {
    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new Error("Blog not found");
    }

    // ✅ Comprehensive validation
    const validationErrors = [];

    // Name validation
    if (!commentData.userName || commentData.userName.trim().length < 2) {
        validationErrors.push("Name must be at least 2 characters long");
    }

    // Email validation (if provided)
    if (commentData.userEmail && commentData.userEmail.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(commentData.userEmail)) {
            validationErrors.push("Please provide a valid email address");
        }
    }

    // Comment content validation
    if (!commentData.content || commentData.content.trim().length < 5) {
        validationErrors.push("Comment must be at least 5 characters long");
    }

    if (commentData.content && commentData.content.trim().length > 1000) {
        validationErrors.push("Comment cannot exceed 1000 characters");
    }

    // Website validation (if provided)
    if (commentData.userWebsite && commentData.userWebsite.trim() !== "") {
        try {
            new URL(commentData.userWebsite);
        } catch (error) {
            validationErrors.push("Please provide a valid website URL");
        }
    }

    if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // ✅ Create new comment
    const newComment = {
        userName: commentData.userName.trim(),
        userEmail: commentData.userEmail ? commentData.userEmail.trim().toLowerCase() : "",
        content: commentData.content.trim(),
        userWebsite: commentData.userWebsite ? commentData.userWebsite.trim() : "",
        isApproved: commentData.isApproved !== undefined ? commentData.isApproved : true,
    };

    blog.comments.push(newComment);
    await blog.save();

    const savedComment = blog.comments[blog.comments.length - 1];

    return {
        success: true,
        comment: savedComment,
        message: 'Comment added successfully'
    };
   }

    async addMultipleComments(blogId, commentsArray) {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            throw new Error("Blog post not found");
        }

        // ✅ REMOVED redundant timestamps
        const newComments = commentsArray.map(comment => ({
            userName: comment.userName,
            userEmail: comment.userEmail,
            content: comment.content,
            userWebsite: comment.userWebsite || "",
            isApproved: comment.isApproved !== undefined ? comment.isApproved : true,
        }));

        blog.comments.push(...newComments);
        await blog.save();

        // Return the newly added comments
        const startIndex = blog.comments.length - newComments.length;
        const savedComments = blog.comments.slice(startIndex);

        return {
            success: true,
            comments: savedComments,
            count: newComments.length,
            message: `${newComments.length} comments added successfully`
        };
    }

    async addCommentWithAutoApproval(blogId, commentData) {
        try {
            const blog = await Blog.findById(blogId);
            if (!blog) {
                throw new Error("Blog post not found");
            }

            // Auto-approval logic
            const isApproved = this.shouldAutoApprove(commentData);

            // ✅ REMOVED redundant timestamps
            const newComment = {
                userName: commentData.userName,
                userEmail: commentData.userEmail,
                content: commentData.content,
                userWebsite: commentData.userWebsite || "",
                isApproved: isApproved,
            };

            blog.comments.push(newComment);
            await blog.save();

            const savedComment = blog.comments[blog.comments.length - 1];

            return {
                success: true,
                comment: savedComment,
                isApproved: isApproved,
                message: isApproved
                    ? "Comment added and approved successfully"
                    : "Comment added and awaiting moderation"
            };

        } catch (error) {
            throw new Error(`Failed to add comment: ${error.message}`);
        }
    }

    shouldAutoApprove(commentData) {
        // ✅ IMPROVED auto-approval logic
        const blacklistedWords = ['spam', 'http://', 'https://', 'buy now', 'click here'];
        const hasBlacklistedWords = blacklistedWords.some(word =>
            commentData.content.toLowerCase().includes(word)
        );

        // Additional checks
        const hasExcessiveLinks = (commentData.content.match(/http/gi) || []).length > 2;
        const isTooShort = commentData.content.trim().length < 5;
        const hasSuspiciousName = !commentData.userName || commentData.userName.trim().length < 2;

        return !hasBlacklistedWords && !hasExcessiveLinks && !isTooShort && !hasSuspiciousName;
    }
}

module.exports = new CommentService();