const Category = require('../../models/Category');
const { uploadStream, deleteFromCloudinary } = require('../../config/cloudinary');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ label: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { label, subtitle, icon } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.label = label || category.label;
    category.subtitle = subtitle || category.subtitle;
    category.icon = icon || category.icon;

    // Handle new image upload
    if (req.file) {
      const uploadedImage = await uploadStream(req.file.buffer, 'agrirent/categories');
      
      // Delete old Cloudinary image if it exists and has public_id
      if (category.img && category.img.public_id) {
        await deleteFromCloudinary(category.img.public_id);
      }
      category.img = uploadedImage;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new category (Admin only)
// @route   POST /api/admin/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
  try {
    const { label, subtitle, icon } = req.body;

    if (!label) {
      return res.status(400).json({ message: 'Category label is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Category image file is required.' });
    }

    // Auto-generate unique value slug from label
    const value = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_+|_+$)/g, '');

    // Check if category value already exists
    const existingCategory = await Category.findOne({ value });
    if (existingCategory) {
      return res.status(400).json({ message: `A category with the label "${label}" already exists.` });
    }

    // Upload to Cloudinary
    const uploadedImage = await uploadStream(req.file.buffer, 'agrirent/categories');

    const newCategory = new Category({
      value,
      label,
      subtitle: subtitle || '',
      icon: icon || '🚜',
      img: uploadedImage,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Delete associated Cloudinary image if it exists and has public_id
    if (category.img && category.img.public_id) {
      await deleteFromCloudinary(category.img.public_id);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  updateCategory,
  createCategory,
  deleteCategory,
};
