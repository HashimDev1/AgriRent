const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

// Validate file type (Images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer instance with 5MB limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper to handle Multer validation errors gracefully
const handleMulterError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum limit is 5MB.' });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Too many files uploaded.' });
          }
          return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

module.exports = {
  uploadEquipmentImages: handleMulterError(upload.array('images', 5)),
  uploadCNICImages: handleMulterError(
    upload.fields([
      { name: 'cnicFrontImage', maxCount: 1 },
      { name: 'cnicBackImage', maxCount: 1 },
      { name: 'profileImage', maxCount: 1 },
    ])
  ),
  uploadEvidenceImages: handleMulterError(upload.array('evidenceImages', 3)),
  uploadCategoryImage: handleMulterError(upload.single('img')),
};
