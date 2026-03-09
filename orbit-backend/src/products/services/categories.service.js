const Category = require("../model/category.model");

class CategoriesService {
  // Get all categories
  async getAll() {
    const categories = await Category.find().sort({ createdAt: -1 });
    return categories;
  }

  // Get a single category by ID
  async getById(id) {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  }

  // Create a new category
  async create(data) {
    const category = new Category({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description || `${data.name} products`,
      status: data.status || "active",
    });
    await category.save();
    return category;
  }

  // Update a category by ID
  async update(id, data) {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    category.name = data.name || category.name;
    category.slug =
      data.slug || category.name.toLowerCase().replace(/\s+/g, "-");
    category.description = data.description || category.description;
    category.status = data.status || category.status;
    await category.save();
    return category;
  }

  // Delete a category by ID
  async delete(id) {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    await category.deleteOne();
    return { success: true, message: "Category deleted successfully" };
  }
}

module.exports = new CategoriesService();
