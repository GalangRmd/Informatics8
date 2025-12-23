// Cloudinary Configuration
// Cloud Name from user: dlhdcu8sr
const CLOUD_NAME = 'dlhdcu8sr';
// IMPORTANT: Create an Unsigned Upload Preset in Cloudinary named 'informatics_upload'
const UPLOAD_PRESET = 'informatics_upload';

/**
 * Uploads a file (image or video) to Cloudinary
 * @param {File} file - The file object from input type="file"
 * @returns {Promise<object>} - The full response data (secure_url, resource_type, etc.)
 */
export const uploadMedia = async (file) => {
    if (!file) return null;

    if (UPLOAD_PRESET === 'REPLACE_WITH_YOUR_PRESET') {
        alert('Please open src/utils/cloudinaryConfig.js and paste your Upload Preset Name!');
        throw new Error('Upload Preset not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // Determine resource type based on file type
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                errorMessage = await response.text(); // Fallback to text if JSON fails
            }
            throw new Error(`Cloudinary Error (${response.status}): ${errorMessage}`);
        }

        const data = await response.json();
        return data; // Return full data to get secure_url and resource_type
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        alert(`UPLOAD FAILED!\n\nCheck your Cloudinary Settings.\n\nError: ${error.message}`);
        throw error;
    }
};

// Keep for backward compatibility if needed, but alias to new function
export const uploadImage = async (file) => {
    const data = await uploadMedia(file);
    return data.secure_url;
};
