import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import GalleryItem from '../components/GalleryItem'
import { getMediaFromDB, addMediaToDB, clearAlbumFromDB } from '../utils/mediaStorage'

const MakrabGallery = () => {
    // State to track photos and selected photo for lightbox
    const [photos, setPhotos] = useState([])
    const [selectedPhoto, setSelectedPhoto] = useState(null)
    const [columns, setColumns] = useState(1)
    const [loading, setLoading] = useState(true)

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

    const handleResetDatabase = async () => {
        if (confirm('Are you sure you want to delete all Makrab photos from the database? This will reset the gallery.')) {
            try {
                setLoading(true)
                await clearAlbumFromDB('makrab-2025')
                alert('Database cleared! Reloading...')
                window.location.reload()
            } catch (error) {
                console.error("Failed to clear DB:", error)
                alert("Failed to clear database")
            } finally {
                setLoading(false)
            }
        }
    }

    // Initialize/Fetch photos from DB
    useEffect(() => {
        // ... existing initialization code ...
        const initializeGallery = async () => {
            try {
                const ALBUM_ID = 'makrab-2025'
                // Complete list of images from the 'Makrab IF-8' folder
                const initialPhotoFiles = [
                    "IMG_1414.JPG", "IMG_1444.JPG", "IMG_1459.JPG", "IMG_1477.JPG", "IMG_1478.JPG", "IMG_1480.JPG", "IMG_1481.JPG", "IMG_1482.JPG", "IMG_1483.JPG", "IMG_1484.JPG",
                    "IMG_1485.JPG", "IMG_1486.JPG", "IMG_1487.JPG", "IMG_1488.JPG", "IMG_1489.JPG", "IMG_1490.JPG", "IMG_1491.JPG", "IMG_1492.JPG", "IMG_1493.JPG", "IMG_1494.JPG",
                    "IMG_1495.JPG", "IMG_1496.JPG", "IMG_1497.JPG", "IMG_1498.JPG", "IMG_1500.JPG", "IMG_1501.JPG", "IMG_1503.JPG", "IMG_1505.JPG", "IMG_1506.jpg", "IMG_1507.jpg",
                    "IMG_1508.jpg", "IMG_1510.jpg", "IMG_1513.jpg", "IMG_1514.jpg", "IMG_1630.JPG", "IMG_1877.jpg", "IMG_1878.jpg", "IMG_1879.jpg", "IMG_1880.jpg", "IMG_1881.jpg",
                    "IMG_1882.jpg", "IMG_1883.jpg", "IMG_1884.jpg", "IMG_1886.jpg", "IMG_1887.jpg", "IMG_1888.jpg", "IMG_1889.jpg", "IMG_1890.jpg", "IMG_1891.jpg", "IMG_1892.jpg",
                    "IMG_1893.jpg", "IMG_1894.jpg", "IMG_1895.jpg", "IMG_1896.jpg", "IMG_1897.jpg", "IMG_1898.jpg", "IMG_1899.jpg", "IMG_1900.jpg", "IMG_1901.jpg", "IMG_1902.jpg",
                    "IMG_1903.jpg", "IMG_1904.jpg", "IMG_1906.jpg", "IMG_1907.jpg", "IMG_1908.jpg", "IMG_1909.jpg", "IMG_1911.jpg", "IMG_1912.jpg", "IMG_1913.jpg", "IMG_1914.jpg",
                    "IMG_1915.jpg", "IMG_1916.jpg", "IMG_1917.jpg", "IMG_1918.jpg", "IMG_1919.jpg", "IMG_1920.jpg", "IMG_1921.jpg", "IMG_1922.jpg", "IMG_1923.jpg", "IMG_1924.jpg",
                    "IMG_1925.jpg", "IMG_1926.jpg", "IMG_1927.jpg", "IMG_1928.jpg", "IMG_1929.jpg", "IMG_1930.jpg", "IMG_1931.jpg", "IMG_1932.jpg", "IMG_1933.jpg", "IMG_1934.jpg",
                    "IMG_1935.jpg", "IMG_1936.jpg", "IMG_1937.jpg", "IMG_1940.jpg", "IMG_1941.jpg", "IMG_1964.jpg", "IMG_1966.jpg", "IMG_1971.jpg", "IMG_1972.jpg", "IMG_1974.jpg",
                    "IMG_1984.jpg", "IMG_1992.jpg", "IMG_2001.jpg", "IMG_2002.jpg", "IMG_2010.jpg", "IMG_2017.jpg", "IMG_2021.jpg", "IMG_2026.jpg", "IMG_2029.jpg", "IMG_2034.jpg",
                    "IMG_2037.jpg", "IMG_2038.jpg", "IMG_2040.jpg", "IMG_2045.jpg", "IMG_2052.jpg", "IMG_2053.jpg", "IMG_2056.jpg", "IMG_2059.jpg", "IMG_2063.jpg", "IMG_2077.jpg",
                    "IMG_2078.jpg", "IMG_2085.jpg", "IMG_2089.jpg", "IMG_2090.jpg", "IMG_2097.jpg", "IMG_2099.jpg", "IMG_2101.jpg", "IMG_2104.jpg", "IMG_2105.jpg", "IMG_2111.jpg",
                    "IMG_2121.jpg", "IMG_2129.jpg", "IMG_2131.jpg", "IMG_2136.jpg", "IMG_2155.jpg", "IMG_2156.jpg", "IMG_2158.jpg", "IMG_2173.jpg", "IMG_2186.jpg", "IMG_2194.jpg",
                    "IMG_2195.jpg", "IMG_2202.jpg", "IMG_2205.jpg", "IMG_2210.jpg", "IMG_2211.jpg", "IMG_2214.jpg", "IMG_2216.jpg", "IMG_2222.jpg", "IMG_2224.jpg", "IMG_2226.jpg",
                    "IMG_2228.jpg", "IMG_2248.jpg", "IMG_2249.jpg", "IMG_2251.jpg", "IMG_2254.jpg", "IMG_2259.jpg", "IMG_2270.jpg", "IMG_2276.jpg", "IMG_2278.jpg", "IMG_2282.jpg",
                    "IMG_2288.jpg", "IMG_2291.jpg", "IMG_2293.jpg", "IMG_2311.jpg", "IMG_2314.jpg", "IMG_2316.jpg", "IMG_2320.jpg", "IMG_2325.jpg", "IMG_2329.jpg", "IMG_2332.jpg",
                    "IMG_2335.jpg", "IMG_2341.jpg", "IMG_2343.jpg", "IMG_2344.jpg", "IMG_2358.JPG", "IMG_2359.JPG", "IMG_2363.JPG", "IMG_2366.JPG", "IMG_2375.JPG", "IMG_2378.JPG",
                    "IMG_2379.JPG", "IMG_2384.JPG", "IMG_2388.JPG", "IMG_2391.JPG", "IMG_2392.JPG", "IMG_2400.JPG", "IMG_2401.JPG", "IMG_2405.JPG", "IMG_2407.JPG", "IMG_2408.JPG",
                    "IMG_2415.JPG", "IMG_2419.JPG", "IMG_2423.JPG", "IMG_2424.JPG", "IMG_2431.JPG", "IMG_2433.JPG", "IMG_2440.JPG", "IMG_2441.JPG", "IMG_2443.JPG", "IMG_2459.JPG",
                    "IMG_2463.JPG", "IMG_2465.JPG", "IMG_2469.JPG", "IMG_2485.JPG", "IMG_2498.JPG", "IMG_2502.JPG", "IMG_2504.JPG", "IMG_2505.JPG", "IMG_2537.JPG", "IMG_2538.JPG",
                    "IMG_2540.JPG", "IMG_2543.JPG", "IMG_2544.JPG", "IMG_2556.JPG", "IMG_2559.JPG", "IMG_2562.JPG", "IMG_2572.JPG", "IMG_2573.JPG", "IMG_2575.JPG", "IMG_2576.JPG",
                    "IMG_2579.JPG", "IMG_2581.JPG", "IMG_2586.JPG", "IMG_2589.JPG", "IMG_2593.JPG", "IMG_2594.JPG", "IMG_2595.JPG", "IMG_2596.JPG", "IMG_2599.JPG", "IMG_2603.JPG",
                    "IMG_2608.JPG", "IMG_2613.JPG", "IMG_2623.JPG", "IMG_2624.JPG", "IMG_2626.JPG", "IMG_2632.JPG", "IMG_2634.JPG", "IMG_2635.JPG", "IMG_2636.JPG"
                ]

                const existingPhotos = await getMediaFromDB(ALBUM_ID)

                // Create a Set of existing file names to avoid duplicates
                const existingFileNames = new Set(existingPhotos.map(p => p.name))
                const newPhotosToAdd = []

                // Check for photos that are in the folder but not in the DB
                for (let i = 0; i < initialPhotoFiles.length; i++) {
                    const fileName = initialPhotoFiles[i]
                    if (!existingFileNames.has(fileName)) {
                        const mediaItem = {
                            id: Date.now() + i, // Unique timestamp-based ID
                            albumId: ALBUM_ID,
                            type: 'image',
                            url: `/Makrab%20IF-8/${fileName}`,
                            name: fileName,
                            date: new Date().toISOString()
                        }
                        await addMediaToDB(mediaItem)
                        newPhotosToAdd.push(mediaItem)
                    }
                }

                if (newPhotosToAdd.length > 0) {
                    console.log(`Added ${newPhotosToAdd.length} new photos to DB`)
                    // Combine existing and new photos for state
                    setPhotos([...existingPhotos, ...newPhotosToAdd])
                } else {
                    setPhotos(existingPhotos)
                }

            } catch (error) {
                console.error("Failed to load gallery:", error)
            } finally {
                setLoading(false)
            }
        }

        initializeGallery()
    }, [])


    // Distribute photos into columns (Left-to-Right filling)
    const columnPhotos = Array.from({ length: columns }, () => [])
    // Need to handle the data structure diff (DB uses 'url', static used 'src')
    // We can map it on the fly or adjust the GalleryItem usage. 
    // GalleryItem likely expects { src, alt }. Let's map it here.
    const displayPhotos = photos.map((p, idx) => ({
        id: p.id,
        src: p.url || p.src, // Support both just in case
        alt: p.name || `Makrab Photo ${idx + 1}`,
        downloadName: p.name
    }))

    displayPhotos.forEach((photo, index) => {
        columnPhotos[index % columns].push(photo)
    })

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Gallery...</div>
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <nav className="mb-16 flex justify-between items-center relative z-20 backdrop-blur-md bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg sticky top-6">
                <Link to="/gallery" className="text-lg font-medium hover:text-blue-400 transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Gallery
                </Link>
                <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight animate-gradient-x">
                    Makrab 2025
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleResetDatabase}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-lg text-sm font-bold border border-red-600/30 transition-colors"
                    >
                        Reset DB
                    </button>
                    <div className="w-[120px] hidden md:block"></div> {/* Spacer */}
                </div>
            </nav>

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
                            <img
                                src={selectedPhoto.src}
                                alt={selectedPhoto.alt}
                                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-white/10"
                            />

                            <div className="mt-6 flex gap-4">
                                <a
                                    href={selectedPhoto.src}
                                    download={selectedPhoto.downloadName}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Image
                                </a>
                                <button
                                    onClick={() => setSelectedPhoto(null)}
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MakrabGallery
