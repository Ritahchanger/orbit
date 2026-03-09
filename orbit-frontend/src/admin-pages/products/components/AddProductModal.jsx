// components/AdminAddProductModal.js
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModal,
  updateFormField,
  addSpecification,
  updateSpecification,
  removeSpecification,
  addFeature,
  updateFeature,
  removeFeature,
  addImages,
  removeImage,
  setErrors,
} from "../redux/add-product-modal-slice";

import { useCreateProduct } from "../../hooks/product.hooks";

import { toast } from "react-hot-toast";

import { useCategories } from "../../hooks/category.mutations";

import {
  X,
  Upload,
  Package,
  DollarSign,
  FileText,
  Scale,
  Box,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const AdminAddProductModal = () => {
  const dispatch = useDispatch();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const categories = categoriesData?.data || [];

  const createProductMutation = useCreateProduct();

  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // Select all needed state from Redux
  const { isModalOpen, formData, specifications, features, images, errors } =
    useSelector((state) => state.productModal);

  // If modal is not open, don't render anything
  if (!isModalOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(updateFormField({ name, value, type, checked }));
  };

  const addSpec = () => {
    dispatch(addSpecification());
  };

  const updateSpec = (index, value) => {
    dispatch(updateSpecification({ index, value }));
  };

  const removeSpec = (index) => {
    dispatch(removeSpecification(index));
  };

  const addFeat = () => {
    dispatch(addFeature());
  };

  const updateFeat = (index, value) => {
    dispatch(updateFeature({ index, value }));
  };

  const removeFeat = (index) => {
    dispatch(removeFeature(index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files?.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    dispatch(addImages(imagePreviews));
  };

  const removeImg = (index) => {
    URL.revokeObjectURL(images[index].preview);
    dispatch(removeImage(index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock || formData.stock < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      dispatch(setErrors(newErrors));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    // Prepare data for the API
    const productData = {
      name: formData.name.trim(),
      sku: formData.sku.trim() || undefined,
      category: formData.category,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice) || 0,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock) || 5,
      description: formData.description.trim(),
      brand: formData.brand?.trim() || undefined,
      warranty: formData.warranty || "1 Year",
      status: formData.status,
      isFeatured: Boolean(formData.isFeatured),
      productType: formData.productType || "gaming",
      weight: formData.weight?.trim() || undefined,
      model: formData.model?.trim() || undefined,
      color: formData.color?.trim() || undefined,
      connectivity: formData.connectivity?.trim() || undefined,
      powerConsumption: formData.powerConsumption?.trim() || undefined,
      specifications: specifications.filter((spec) => spec.trim() !== ""),
      features: features.filter((feature) => feature.trim() !== ""),
    };

    const imageFiles = images?.map((img) => img.file);

    try {
      await createProductMutation.mutateAsync({
        productData,
        files: imageFiles,
      });
      dispatch(closeModal());
      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Product
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Fill in the product details below
              </p>
            </div>
            <button
              onClick={() => dispatch(closeModal())}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors text-gray-700 dark:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 bg-white dark:bg-gray-800 border ${errors.name ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU (Auto-generated if empty)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="Will auto-generate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 bg-white dark:bg-gray-800 border ${errors.category ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
                >
                  <option value="" className="text-gray-500 dark:text-gray-400">
                    Select category
                  </option>
                  {categories?.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="text-gray-900 dark:text-white"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                Pricing & Stock
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selling Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">
                      KSh
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-3 py-2.5 bg-white dark:bg-gray-800 border ${errors.price ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">
                      KSh
                    </span>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className="w-full pl-12 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 bg-white dark:bg-gray-800 border ${errors.stock ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.stock && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.stock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Stock Alert
                  </label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder="5"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                >
                  <option
                    value="active"
                    className="text-gray-900 dark:text-white"
                  >
                    Active
                  </option>
                  <option
                    value="inactive"
                    className="text-gray-900 dark:text-white"
                  >
                    Inactive
                  </option>
                  <option
                    value="In Stock"
                    className="text-gray-900 dark:text-white"
                  >
                    In Stock
                  </option>
                  <option
                    value="Low Stock"
                    className="text-gray-900 dark:text-white"
                  >
                    Low Stock
                  </option>
                  <option
                    value="Out of Stock"
                    className="text-gray-900 dark:text-white"
                  >
                    Out of Stock
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600"
                />
                <label
                  htmlFor="isFeatured"
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Mark as Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Description *
            </h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2.5 bg-white dark:bg-gray-800 border ${errors.description ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors`}
              placeholder="Enter detailed product description..."
            />
            {errors.description && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Product Images
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center bg-gray-50 dark:bg-gray-800/50">
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop images or click to upload
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                  Supports JPG, PNG, WebP up to 5MB
                </p>
                <input
                  type="file"
                  id="imageUpload"
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                />
                <label
                  htmlFor="imageUpload"
                  className="inline-block px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-sm cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                >
                  Browse Images
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-sm border border-gray-300 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImg(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 dark:bg-red-500 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 dark:hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {image.name.substring(0, 20)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Specifications
            </h3>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => updateSpec(index, e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder={`Specification ${index + 1} (e.g., Processor: Intel i7)`}
                  />
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpec(index)}
                      className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-sm transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Specification
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Features
            </h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeat(index, e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    placeholder={`Feature ${index + 1} (e.g., RGB Lighting)`}
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeat(index)}
                      className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeat}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-sm transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Feature
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Physical Details
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="2.5 kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="Model number"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Other Details
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="Black, White, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Connectivity
                </label>
                <input
                  type="text"
                  name="connectivity"
                  value={formData.connectivity}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="Wi-Fi 6, Bluetooth 5.2, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Power Consumption
                </label>
                <input
                  type="text"
                  name="powerConsumption"
                  value={formData.powerConsumption}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="850W, 240W, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Warranty
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  placeholder="1 Year"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-800 p-6 -mx-6 -mb-6">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => dispatch(closeModal())}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProductMutation.isPending}
                className="px-6 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-sm hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {createProductMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProductModal;
