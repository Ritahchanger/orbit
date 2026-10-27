const Category = require("../models/category.model");
const Product = require("../models/products.model");
const CustomError = require("../../errors/CustomError");

const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, "-");

// Products reference their category by (lowercased) name, so a category's
// name is what ties it to products.
const normaliseName = (name) => String(name || "").trim().toLowerCase();

class CategoriesService {
  // Get all categories
  async getAll(businessId) {
    const categories = await Category.find({ businessId: businessId }).sort({
      createdAt: -1,
    });
    return categories;
  }

  // Get a single category of this business by ID
  async getById(id, businessId) {
    const category = await Category.findOne({ _id: id, businessId });
    if (!category) throw CustomError.notFound("Category not found");
    return category;
  }

  async assertNameAvailable(name, businessId, exceptId = null) {
    const filter = { businessId, name: normaliseName(name) };
    if (exceptId) filter._id = { $ne: exceptId };
    if (await Category.exists(filter)) {
      throw CustomError.conflict(`A category named "${name.trim()}" already exists`);
    }
  }

  // Create a new category
  async create(data) {
    if (!normaliseName(data.name)) {
      throw CustomError.badRequest("Category name is required");
    }
    await this.assertNameAvailable(data.name, data.businessId);

    const category = new Category({
      name: data.name,
      slug: data.slug || toSlug(data.name),
      description: data.description || `${data.name.trim()} products`,
      status: data.status || "active",
      businessId: data.businessId, // Associate with business
    });
    await category.save();
    return category;
  }

  // Update a category of this business. Renaming it renames the category on
  // its products too, so they keep pointing at it.
  async update(id, businessId, data) {
    const category = await this.getById(id, businessId);
    const oldName = category.name;

    if (data.name !== undefined) {
      const newName = normaliseName(data.name);
      if (!newName) throw CustomError.badRequest("Category name is required");
      if (newName !== oldName) {
        await this.assertNameAvailable(data.name, businessId, category._id);
        category.name = data.name;
        category.slug = data.slug || toSlug(data.name);
      }
    }
    // An empty string clears the description
    if (data.description !== undefined) category.description = data.description;
    if (data.status !== undefined) category.status = data.status;

    await category.save();

    if (category.name !== oldName) {
      await Product.updateMany(
        { businessId, category: oldName },
        { $set: { category: category.name } },
      );
    }
    return category;
  }

  // Delete a category of this business, unless products still use it
  async delete(id, businessId) {
    const category = await this.getById(id, businessId);

    const productCount = await Product.countDocuments({
      businessId,
      category: category.name,
    });
    if (productCount > 0) {
      throw CustomError.conflict(
        `${productCount} product${productCount === 1 ? " uses" : "s use"} this category. Move ${productCount === 1 ? "it" : "them"} to another category before deleting it.`,
        { productCount },
      );
    }

    await category.deleteOne();
    return { success: true, message: "Category deleted successfully" };
  }
}

module.exports = new CategoriesService();
