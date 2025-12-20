// Cloudinary Configuration
// Cloud Name from user: dlhdcu8sr
const CLOUD_NAME = 'dlhdcu8sr';
// IMPORTANT: Create an Unsigned Upload Preset in Cloudinary named 'informatics_upload'
const UPLOAD_PRESET = 'informatics_upload';

/**
 * Uploads an image file to Cloudinary
 * @param {File} file - The file object from input type="file"
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImage = async (file) => {
    if (!file) return null;

    if (UPLOAD_PRESET === 'REPLACE_WITH_YOUR_PRESET') {
        alert('Please open src/utils/cloudinaryConfig.js and paste your Upload Preset Name!');
        throw new Error('Upload Preset not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        alert('Upload Error: ' + error.message); // Show error to user
        throw error;
    }
};
