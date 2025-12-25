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

    let fileToUpload = file;

    // Compress Image if it's an image
    if (resourceType === 'image') {
        try {
            fileToUpload = await compressImage(file);
        } catch (error) {
            console.warn('Compression failed, using original file:', error);
        }
    }

    try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', UPLOAD_PRESET);

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

/**
 * Compresses an image file using browser Canvas.
 * Max dimension: 1920px. Quality: 0.8.
 */
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1920;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    // Create a new File from the blob to mimic original file input
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
