import { useState, useEffect, useRef } from "react";

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
  Save,
} from "lucide-react";

import { toast } from "react-hot-toast";

import { useUpdateProduct } from "../../hooks/product.hooks";

const AdminEditProductModal = ({ product, categories, onClose, onSuccess }) => {

  const updateProductMutation = useUpdateProduct();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    costPrice: "",
    stock: "",
    minStock: "5",
    description: "",
    brand: "",
    warranty: "1 Year",
    status: "active",
    isFeatured: false,
    productType: "gaming",
    weight: "",
    model: "",
    color: "",
    connectivity: "",
    powerConsumption: "",
  });

  const [specifications, setSpecifications] = useState([""]);
  const [features, setFeatures] = useState([""]);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [newImages, setNewImages] = useState([]);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        price: product.price || "",
        costPrice: product.costPrice || "",
        stock: product.stock || "",
        minStock: product.minStock || 5,
        description: product.description || "",
        brand: product.brand || "",
        warranty: product.warranty || "1 Year",
        status: product.status || "active",
        isFeatured: product.isFeatured || false,
        productType: product.productType || "gaming",
        weight: product.weight || "",
        model: product.model || "",
        color: product.color || "",
        connectivity: product.connectivity || "",
        powerConsumption: product.powerConsumption || "",
      });

      setSpecifications(
        product.specifications && product.specifications.length > 0
          ? product.specifications
          : [""],
      );

      setFeatures(
        product.features && product.features.length > 0
          ? product.features
          : [""],
      );

      // Set existing images
      if (product.images && product.images.length > 0) {
        setImages(
          product.images.map((img) => ({
            displayUrl: img.displayUrl || img.url,
            gcsFileName: img.gcsFileName,
            name: img.gcsFileName ? img.gcsFileName.split("/").pop() : "image",
            isExisting: true,
          })),
        );
      } else {
        setImages([]);
      }

      setNewImages([]);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Specifications
  const addSpecification = () => {
    setSpecifications([...specifications, ""]);
  };

  const updateSpecification = (index, value) => {
    const newSpecs = [...specifications];
    newSpecs[index] = value;
    setSpecifications(newSpecs);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(newSpecs);
    }
  };

  // Features
  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index);
      setFeatures(newFeatures);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...imagePreviews]);
    setNewImages((prev) => [...prev, ...imagePreviews]);
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove.preview && !imageToRemove.isExisting) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    if (!imageToRemove.isExisting) {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || 0,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock) || 5,
        description: formData.description.trim(),
        brand: formData.brand?.trim() || "",
        warranty: formData.warranty || "1 Year",
        status: formData.status,
        isFeatured: Boolean(formData.isFeatured),
        productType: formData.productType || "gaming",
        weight: formData.weight?.trim() || "",
        model: formData.model?.trim() || "",
        color: formData.color?.trim() || "",
        connectivity: formData.connectivity?.trim() || "",
        powerConsumption: formData.powerConsumption?.trim() || "",
        specifications: specifications.filter((spec) => spec.trim() !== ""),
        features: features.filter((feature) => feature.trim() !== ""),
      };

      // Get new image files
      const newImageFiles = newImages.map((img) => img.file);

      // Get existing images data
      const existingImages = images
        .filter((img) => img.isExisting)
        .map((img) => ({
          displayUrl: img.displayUrl,
          gcsFileName: img.gcsFileName,
          isPrimary: img.isPrimary || false,
        }));

      // Use TanStack Query mutation
      await updateProductMutation.mutateAsync({
        productId: product._id || product.id,
        productData: updateData,
        files: newImageFiles,
        existingImages: existingImages,
      });

      // Clean up new image previews
      newImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark border border-gray-200 dark:border-gray-800 rounded-sm shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Product
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Editing: {product.name}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                SKU: {product.sku}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm' transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-primary" />
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
                  className={`w-full px-3 py-2 bg-white dark:bg-dark-light border ${
                    errors.name
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku || product.sku}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  SKU cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white dark:bg-dark-light border ${
                    errors.category
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-500" />
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
                      className={`w-full pl-12 pr-3 py-2 bg-white dark:bg-dark-light border ${
                        errors.price
                          ? "border-red-300 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      } rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                      className="w-full pl-12 pr-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className={`w-full px-3 py-2 bg-white dark:bg-dark-light border ${
                      errors.stock
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    } rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                    className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <label
                  htmlFor="isFeatured"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Mark as Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Description *
            </h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2 bg-white dark:bg-dark-light border ${
                errors.description
                  ? "border-red-300 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
              <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-500" />
              Product Images
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-sm p-6 text-center bg-gray-50 dark:bg-dark-light">
                <Upload className="h-10 w-10 text-gray-500 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-400 mb-2">
                  Add new images or replace existing ones
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
                  className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm cursor-pointer transition-colors"
                >
                  Add New Images
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview || image.displayUrl || image.url}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-sm border border-gray-200 dark:border-gray-700"
                      />
                      {image.isExisting && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Existing
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded truncate max-w-[120px]">
                        {image.name?.substring(0, 20) || "image"}
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
              <Scale className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              Specifications
            </h3>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => updateSpecification(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Specification ${index + 1}`}
                  />
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Specification
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              Features
            </h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Feature ${index + 1}`}
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-sm transition-colors"
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
                <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Model number"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Box className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1 Year"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-800 p-6 -mx-6 -mb-6 mt-6">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProductModal;
