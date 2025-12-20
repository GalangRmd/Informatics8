import initialData from '../data/db.json';
import { addMediaToDB, getMediaFromDB, deleteMediaFromDB } from './mediaStorage';

const STORAGE_KEY = 'gallery_albums';

// Initialize LocalStorage with default data if empty
// Initialize LocalStorage with default data if empty
const initializeData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // No default albums for now, or just empty
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
};

export const getAlbums = () => {
    initializeData();
    let customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // FORCE REMOVE 'makrab-2025' from LocalStorage if it persists
    // This is to support the user request to delete it permanently even if it's in their browser cache
    if (customAlbums.some(a => a.id === 'makrab-2025')) {
        customAlbums = customAlbums.filter(a => a.id !== 'makrab-2025');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customAlbums));
        console.log("Force deleted Makrab 2025 album from local storage");
    }

    return customAlbums;
};

export const addAlbum = (album) => {
    const customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newAlbum = {
        ...album,
        id: `custom-${Date.now()}`, // Generate unique ID
        bgImages: [], // Default empty for now
        count: '0 Items', // Changed to Items to be generic
        isDefault: false
    };

    // Add default placeholders if no cover provided
    if (!newAlbum.cover) {
        newAlbum.cover = 'https://placehold.co/600x400/1e293b/475569?text=New+Album'; // Placeholder
    }

    const updatedAlbums = [...customAlbums, newAlbum];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlbums));
    return newAlbum;
};

export const deleteAlbum = (id) => {
    const customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedAlbums = customAlbums.filter(album => album.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlbums));
};

export const updateAlbum = (id, updatedData) => {
    const customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedAlbums = customAlbums.map(album =>
        album.id === id ? { ...album, ...updatedData } : album
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlbums));
};

// Helper: Generate a small thumbnail for the cover
const generateThumbnail = (input) => {
    return new Promise((resolve) => {
        // Optimization for Cloudinary URLs
        // If it's a string and contains 'cloudinary.com', use their URL transformation API
        if (typeof input === 'string' && input.includes('cloudinary.com') && input.includes('/upload/')) {
            // Insert transformation params after '/upload/'
            // Example: .../upload/v123/img.jpg -> .../upload/w_500,h_500,c_fill,q_auto/v123/img.jpg
            const thumbnailUrl = input.replace('/upload/', '/upload/w_500,h_500,c_fill,q_auto/');

            // For video, also ensure extension is .jpg (Cloudinary auto-generates poster)
            if (input.includes('/video/')) {
                // Replace /video/ with /image/ if needed or just handle extension
                // Usually cloudinary video thumbnails are just changing .mp4 to .jpg
                // But simplest is keeping as is, but Cloudinary might need specific handling.
                // Actually, for video poster, using resource_type image with same ID works.
                // But let's stick to simple resize for now.
                // Better: Replace extension.
                const lastDotIndex = thumbnailUrl.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    resolve(thumbnailUrl.substring(0, lastDotIndex) + '.jpg');
                } else {
                    resolve(thumbnailUrl + '.jpg');
                }
                return;
            }

            resolve(thumbnailUrl);
            return;
        }

        // Original Logic for Local Files / Blobs
        // Determine source and type
        let src;
        let isVideo = false;

        if (typeof input === 'string') {
            // It's a Data URL
            src = input;
            isVideo = input.startsWith('data:video');
        } else {
            // It's a File object
            src = URL.createObjectURL(input);
            isVideo = input.type.startsWith('video');
        }

        if (isVideo) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true; // Important for autoplay policy handling
            video.playsInline = true;

            video.onloadeddata = () => {
                // Calculate seek time (1s or 25% of duration if short)
                let seekTime = 1;
                if (video.duration && video.duration < 1) {
                    seekTime = video.duration / 2;
                }
                video.currentTime = seekTime;
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate dimensions to fit 500x500
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;
                let width = video.videoWidth;
                let height = video.videoHeight;

                // Handle cases where video dimensions aren't ready
                if (!width || !height) {
                    URL.revokeObjectURL(video.src);
                    resolve(null);
                    return;
                }

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

                ctx.drawImage(video, 0, 0, width, height);
                if (typeof input !== 'string') URL.revokeObjectURL(video.src);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };

            video.onerror = () => {
                if (typeof input !== 'string') URL.revokeObjectURL(video.src);
                resolve(null);
            };

            video.src = src;
            // Trigger load
            video.load();

        } else {
            // Image handling (supports both File and Data URL string)
            const img = new Image();
            img.colorSpace = 'srgb';
            img.crossOrigin = 'anonymous'; // Try to enable CORS access
            img.src = src;

            if (typeof input !== 'string') {
                img.src = URL.createObjectURL(input);
            }

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;

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
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    if (typeof input !== 'string') URL.revokeObjectURL(img.src);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                } catch (e) {
                    console.warn("Canvas tainted, returning original for thumbnail fallack");
                    resolve(src); // Fallback: return usage original src if we can't resize
                }
            };
            img.onerror = () => {
                if (typeof input !== 'string') URL.revokeObjectURL(img.src);
                // resolve(null);
                resolve(src); // Fallback to original
            };
        }
    });
};


// Helper: Recalculate stats AND refresh covers for an album based on IDB content
export const recalculateAlbumStats = async (albumId) => {
    try {
        const mediaItems = await getMediaFromDB(albumId);

        let photoCount = 0;
        let videoCount = 0;

        // Sort by id (timestamp) descending to get newest first
        const sortedMedia = [...mediaItems].sort((a, b) => b.id - a.id);

        // Add base counts for Makrab 2025 (static data)
        if (albumId === 'makrab-2025') {
            photoCount += 258; // Base photos
        }

        // Count IDB items
        mediaItems.forEach(item => {
            if (item.type === 'video') {
                videoCount++;
            } else {
                photoCount++;
            }
        });

        // REFRESH COVERS LOGIC
        // We will generate thumbnails for the top 3 items if they exist
        // This ensures even old videos get thumbnails now that we support them
        let newCover = null;
        let newBgImages = [];

        // Only attempt to regenerate previews if we have media in IDB
        // (For Makrab, we want to respect its static defaults if IDB is empty, 
        // but if user added media, that takes precedence usually? 
        // Actually, Makrab mixes static + dynamic. Let's only update if we have dynamic items, 
        // otherwise fetching undefined covers might break it. 
        // But for custom albums, this is critical.)

        if (sortedMedia.length > 0) {
            // Generate thumbnails for up to the first 4 items (1 Cover + 3 Bg)
            const itemsToProcess = sortedMedia.slice(0, 4);
            const thumbnails = await Promise.all(itemsToProcess.map(async (item) => {
                return await generateThumbnail(item.src); // item.src is Data URL
            }));

            if (thumbnails[0]) newCover = thumbnails[0];
            // Filter out nulls and take the rest for bg (exclude main cover)
            newBgImages = thumbnails.slice(1).filter(t => t);
        }

        const customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updatedAlbums = customAlbums.map(album => {
            if (album.id === albumId) {
                // If we found new dynamic covers, use them. 
                // Otherwise fall back to existing (important for Makrab static seed)
                const finalCover = newCover || album.cover;

                // For bgImages, we merge or replace?
                // If we have dynamic media, it should probably dominate.
                // But for Makrab, we might want to keep the static ones if we only have 1 dynamic item?
                // Let's stick to the behavior: Newest items = Cover/Bg.
                // If we have dynamic items, use them.

                let finalBgImages = album.bgImages;
                if (newCover) {
                    finalBgImages = newBgImages;
                }

                return {
                    ...album,
                    stats: {
                        photos: photoCount,
                        videos: videoCount
                    },
                    // Respect manual cover if set, otherwise use new dynamic cover or fallback
                    cover: album.isManualCover ? album.cover : (finalCover || album.cover),
                    bgImages: finalBgImages,
                    // Keep legacy count for fallback or validation
                    count: `${photoCount + videoCount} Items`
                };
            }
            return album;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlbums));
        return { photos: photoCount, videos: videoCount };

    } catch (error) {
        console.error("Error recalculating stats:", error);
    }
};

export const setAlbumCover = async (albumId, src) => {
    try {
        let finalSrc = src;

        // If it's a huge Base64 string (Data URL), generate a thumbnail first
        if (src.startsWith('data:')) {
            const thumbnail = await generateThumbnail(src);
            if (thumbnail) {
                finalSrc = thumbnail;
            }
        }

        const customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updatedAlbums = customAlbums.map(album => {
            if (album.id === albumId) {
                return {
                    ...album,
                    cover: finalSrc,
                    isManualCover: true // Lock this cover so it doesn't get auto-replaced
                };
            }
            return album;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlbums));
    } catch (error) {
        console.error("Error setting album cover:", error);
        alert("Failed to set cover. Storage might be full.");
    }
};

export const syncAllAlbumStats = async () => {
    const customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    for (const album of customAlbums) {
        await recalculateAlbumStats(album.id);
    }
    return getAlbums();
};

export const addMediaToAlbum = async (albumId, input) => {
    try {
        let base64Data;
        let type;
        let name;

        if (input instanceof File) {
            const reader = new FileReader();
            // Read file for IDB storage (Legacy/Fallback)
            base64Data = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(input);
            });
            type = input.type.startsWith('video') ? 'video' : 'image';
            name = input.name;
        } else if (typeof input === 'object' && input.src) {
            // Cloudinary or External URL input
            base64Data = input.src;
            type = input.type;
            name = input.name;
        } else {
            throw new Error("Invalid input for addMediaToAlbum");
        }

        const newMedia = {
            id: Date.now(),
            albumId: albumId,
            src: base64Data, // Storing full file or Cloudinary URL
            type: type,
            date: new Date().toLocaleDateString(),
            name: name
        };

        // 1. Save to IndexedDB (Unlimited Storage)
        await addMediaToDB(newMedia);

        // 2. Update Album Stats in LocalStorage
        await recalculateAlbumStats(albumId);

        // 3. Dynamic Cover Update (Image Or Video)
        // Allow videos to generate thumbnails too
        if (type === 'image' || type === 'video') {
            const thumbnail = await generateThumbnail(base64Data);
            if (thumbnail) {
                const customAlbums = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                const updatedAlbums = customAlbums.map(album => {
                    if (album.id === albumId) {
                        const oldCover = album.cover;
                        const oldBgImages = album.bgImages || [];

                        // Don't add placeholder covers to bgImages
                        const isPlaceholder = oldCover && oldCover.includes('placehold.co');

                        let newBgImages = [...oldBgImages];
                        if (!isPlaceholder && oldCover) {
                            newBgImages = [oldCover, ...oldBgImages].slice(0, 3); // Keep max 3
                        }

                        return {
                            ...album,
                            cover: thumbnail,
                            bgImages: newBgImages
                        };
                    }
                    return album;
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlbums));
            }
        }

        return newMedia;

    } catch (error) {
        console.error("Error adding media:", error);
        throw error;
    }
};

export const getAlbumMedia = async (albumId) => {
    // Fetch from IndexedDB
    return await getMediaFromDB(albumId);
};

export const deleteMedia = async (mediaId, albumId) => {
    try {
        // 1. Delete from IDB
        await deleteMediaFromDB(mediaId);

        // 2. Update Album Stats in LocalStorage
        await recalculateAlbumStats(albumId);

    } catch (error) {
        console.error("Error deleting media:", error);
        throw error;
    }
};
