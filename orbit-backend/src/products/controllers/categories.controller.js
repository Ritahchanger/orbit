const CategoryService = require("../services/categories.service");

class CategoriesController {
  // GET /categories
  async getAll(req, res) {
    
    const businessId = req.businessId; // Get businessId from request (set by auth middleware)

    console.log("Fetching categories for businessId:", businessId);
    const categories = await CategoryService.getAll(businessId);
    res.status(200).json({ success: true, data: categories });
  }

  // GET /categories/:id
  async getById(req, res) {
    const { id } = req.params;
    const category = await CategoryService.getById(id);
    res.status(200).json({ success: true, data: category });
  }

  // POST /categories
  async create(req, res) {
    const data = req.body;
    const businessId = req.businessId;
    data.businessId = businessId; // Associate category with the business
    const category = await CategoryService.create(data);
    res.status(201).json({ success: true, data: category });
  }

  // PUT /categories/:id
  async update(req, res) {
    const { id } = req.params;
    const data = req.body;
    const updatedCategory = await CategoryService.update(id, data);
    res.status(200).json({ success: true, data: updatedCategory });
  }

  // DELETE /categories/:id
  async delete(req, res) {
    const { id } = req.params;
    const result = await CategoryService.delete(id);
    res.status(200).json(result);
  }
}

module.exports = new CategoriesController();
