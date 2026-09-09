const cloudinary = require('cloudinary').v2;

const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
} else {
  console.warn(
    '\x1b[33m%s\x1b[0m', // Yellow output
    'WARNING: Cloudinary environment variables are missing in /server/.env. Real image uploads are disabled. Falling back to mock uploads.'
  );
}

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * Falls back to a default placeholder if Cloudinary is not configured.
 * @param {Buffer} fileBuffer - The buffer of the file.
 * @param {string} folder - Target folder inside Cloudinary.
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadStream = (fileBuffer, folder) => {
  if (!isConfigured) {
    return Promise.resolve({
      url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80',
      public_id: 'mock_id_' + Date.now() + '_' + Math.random().toString(36).substring(7),
    });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using public_id.
 * Skips deletion if it's a mock upload.
 * @param {string} publicId - The public ID of the image on Cloudinary.
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!isConfigured || (publicId && publicId.startsWith('mock_id_'))) {
    return Promise.resolve({ result: 'ok' });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadStream,
  deleteFromCloudinary,
};
