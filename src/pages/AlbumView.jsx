import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import GalleryItem from '../components/GalleryItem'
import { getAlbums, addMediaToAlbum, getAlbumMedia, setAlbumCover, deleteMedia } from '../utils/galleryData'
import { useAuth } from '../context/AuthContext'
import { uploadImage } from '../utils/cloudinaryConfig'

const AlbumView = () => {
    const { isAdmin } = useAuth()
    const { id } = useParams()
    const [selectedPhoto, setSelectedPhoto] = useState(null)
    const [columns, setColumns] = useState(1)
    const [title, setTitle] = useState('Gallery')
    const [photos, setPhotos] = useState([])
    const [isDefaultAlbum, setIsDefaultAlbum] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef(null)

    // Load Album Data
    // Load Album Data
    useEffect(() => {
        const loadAlbumData = async () => {
            try {
                const allAlbums = await getAlbums();
                const currentAlbum = (allAlbums || []).find(a => a.id === id); // Safe check

                if (currentAlbum) {
                    setTitle(currentAlbum.title)
                    setIsDefaultAlbum(!!currentAlbum.isDefault)
                }

                // Load Photos based on ID
                let mediaItems = await getAlbumMedia(id);

                // Safe sort and map
                const processedPhotos = (mediaItems || [])
                    .map(item => ({
                        ...item,
                        downloadName: item.name || `photo-${item.id}`,
                        alt: item.name || 'Gallery Photo'
                    }))
                    .sort((a, b) => {
                        const nameA = a.name || '';
                        const nameB = b.name || '';
                        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
                    });

                setPhotos(processedPhotos);

            } catch (error) {
                console.error("Failed to load album data:", error);
                // Fallback to empty to avoid crash
                setPhotos([]);
            }
        }
        loadAlbumData()
    }, [id])

    const [isDragActive, setIsDragActive] = useState(false)
    const [showCoverConfirm, setShowCoverConfirm] = useState(false)

    // Process multiple files sequentially
    const processFiles = async (fileList) => {
        if (!fileList || fileList.length === 0) return

        setIsUploading(true)
        try {
            // Convert FileList to Array
            const files = Array.from(fileList)

            // Upload sequentially to ensure unique IDs (Date.now())
            // Upload sequentially to ensure unique IDs (Date.now())
            for (const file of files) {
                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    // Upload to Cloudinary first
                    const secureUrl = await uploadImage(file);

                    if (secureUrl) {
                        const type = file.type.startsWith('video/') ? 'video' : 'image';
                        await addMediaToAlbum(id, {
                            src: secureUrl,
                            type,
                            name: file.name
                        });
                    }
                }
            }

            // Refresh logic
            const updatedMedia = await getAlbumMedia(id)
            setPhotos(updatedMedia.map(item => ({
                ...item,
                downloadName: item.name,
                alt: item.name
            })).sort((a, b) => (a.name || '').localeCompare((b.name || ''), undefined, { numeric: true, sensitivity: 'base' })))
        } catch (error) {
            alert("Failed to upload media. " + error.message)
            console.error(error)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Handle File Input Change
    const handleFileUpload = (event) => {
        processFiles(event.target.files)
    }

    const handleDelete = async () => {
        if (!selectedPhoto || !window.confirm("Are you sure you want to delete this photo?")) return;

        try {
            await deleteMedia(selectedPhoto.id, id);

            // Update local state
            setPhotos(prev => prev.filter(p => p.id !== selectedPhoto.id));
            setSelectedPhoto(null);

        } catch (error) {
            alert("Failed to delete photo: " + error.message);
        }
    };

    // Drag and Drop Handlers
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true)
        } else if (e.type === 'dragleave') {
            setIsDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files)
        }
    }

    // Handle responsive column count
    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1024) {
                setColumns(3) // Desktop
            } else if (window.innerWidth >= 768) {
                setColumns(2) // Tablet
            } else {
                setColumns(1) // Mobile
            }
        }

        updateColumns()
        window.addEventListener('resize', updateColumns)
        return () => window.removeEventListener('resize', updateColumns)
    }, [])

    // Distribute photos into columns (Left-to-Right filling)
    const columnPhotos = Array.from({ length: columns }, () => [])
    photos.forEach((photo, index) => {
        columnPhotos[index % columns].push(photo)
    })

    return (
        <div
            className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8 relative overflow-hidden"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-blue-600/20 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"
                    >
                        <div className="text-center">
                            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <h2 className="text-4xl font-black text-white drop-shadow-lg">Drop files to upload!</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Unified Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl relative z-20">

                    {/* Left: Back Button */}
                    <div className="w-full md:w-auto flex justify-start md:flex-1">
                        <Link to="/gallery">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-6 py-3 bg-white/10 text-white rounded-full font-bold shadow-lg shadow-white/5 overflow-hidden border border-white/10 backdrop-blur-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back to Gallery
                                </span>
                            </motion.button>
                        </Link>
                    </div>

                    {/* Center: Title & Stats */}
                    <div className="text-center md:flex-[2]">
                        <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight animate-gradient-x mb-2">
                            {title}
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base font-medium">
                            {isDefaultAlbum ? (
                                <span>258 Photos • 0 Videos</span>
                            ) : (
                                <span>{photos.filter(p => !p.type || p.type === 'image').length} Photos • {photos.filter(p => p.type === 'video').length} Videos</span>
                            )}
                        </p>
                    </div>

                    {/* Right: Upload Button (or Spacer) */}
                    <div className="w-full md:w-auto flex justify-center md:justify-end md:flex-1">
                        {isAdmin && !isDefaultAlbum ? (
                            <>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*,video/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={isUploading}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Upload Media
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="w-[170px] hidden md:block"></div> /* Spacer to keep title centered */
                        )}
                    </div>
                </div>

                {photos.length > 0 ? (
                    <motion.div
                        className="flex gap-4 relative z-10 mx-auto max-w-7xl items-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        {columnPhotos.map((col, colIndex) => (
                            <div key={colIndex} className="flex-1 flex flex-col gap-4">
                                {col.map((photo) => (
                                    <GalleryItem
                                        key={photo.id}
                                        photo={photo}
                                        onClick={() => setSelectedPhoto(photo)}
                                    />
                                ))}
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="relative z-10 text-center py-20 flex flex-col items-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-xl font-medium">No photos or videos yet</p>
                        {!isDefaultAlbum && <p className="text-gray-600 mt-2">Upload something to get started!</p>}
                    </div>
                )}

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {selectedPhoto && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-sm"
                            onClick={() => setSelectedPhoto(null)} // Close on backdrop click
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative max-w-7xl max-h-screen flex flex-col items-center"
                                onClick={(e) => e.stopPropagation()} // Prevent close on image click
                            >
                                {selectedPhoto.type === 'video' ? (
                                    <video
                                        src={selectedPhoto.src}
                                        className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-white/10"
                                        controls
                                        autoPlay
                                    />
                                ) : (
                                    <img
                                        src={selectedPhoto.src}
                                        alt={selectedPhoto.alt}
                                        className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-white/10"
                                    />
                                )}

                                <div className="mt-6 flex gap-4">
                                    <a
                                        href={selectedPhoto.src}
                                        download={selectedPhoto.downloadName}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download {selectedPhoto.type === 'video' ? 'Video' : 'Image'}
                                    </a>
                                    <button
                                        onClick={() => setSelectedPhoto(null)}
                                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-colors"
                                    >
                                        Close
                                    </button>

                                    {isAdmin && !isDefaultAlbum && (
                                        <>
                                            <button
                                                onClick={() => setShowCoverConfirm(true)}
                                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-colors flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Set as Cover
                                            </button>

                                            <button
                                                onClick={handleDelete}
                                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-colors flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Custom Set Cover Confirmation Modal */}
                <AnimatePresence>
                    {showCoverConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowCoverConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-purple-500/20 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 text-center">Update Album Cover?</h3>
                                <p className="text-gray-400 mb-6 text-center">
                                    This photo will become the new cover for this album.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCoverConfirm(false)}
                                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await setAlbumCover(id, selectedPhoto.src)
                                            setShowCoverConfirm(false)
                                            // No alert, just close
                                        }}
                                        className="flex-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-lg shadow-purple-600/20"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    )
}

export default AlbumView
