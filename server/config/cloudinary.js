const cloudinary = require('cloudinary').v2;

let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;
let cloudinaryUrl = process.env.CLOUDINARY_URL;

// Parse CLOUDINARY_URL if provided (and clean any accidental angle brackets < >)
if (cloudinaryUrl) {
  const cleanUrl = cloudinaryUrl.replace(/[<>]/g, '').trim();
  const match = cleanUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (match) {
    apiKey = apiKey || match[1];
    apiSecret = apiSecret || match[2];
    cloudName = cloudName || match[3];
  }
}

// Clean any accidental angle brackets or whitespace from individual variables
if (cloudName) cloudName = cloudName.replace(/[<>]/g, '').trim();
if (apiKey) apiKey = apiKey.replace(/[<>]/g, '').trim();
if (apiSecret) apiSecret = apiSecret.replace(/[<>]/g, '').trim();

const isConfigured = !!(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log(`✅ Cloudinary configured successfully for cloud: ${cloudName}`);
} else {
  console.warn(
    '\x1b[33m%s\x1b[0m', // Yellow output
    'WARNING: Cloudinary credentials not configured. Real image uploads are disabled. Falling back to mock uploads.'
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
      url: 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg',
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
