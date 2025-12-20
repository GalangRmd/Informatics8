import { motion } from 'framer-motion'
import { useState } from 'react'

const GalleryItem = ({ photo, onClick }) => {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative group rounded-2xl overflow-hidden bg-gray-800 break-inside-avoid mb-8 cursor-zoom-in shadow-xl ring-1 ring-white/10"
            onClick={onClick}
            whileHover={{ y: -5 }}
        >
            {/* Loading Skeleton */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center z-10">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin opacity-50"></div>
                </div>
            )}

            {/* Gradient Border Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>

            {photo.type === 'video' ? (
                <video
                    src={photo.src}
                    className={`w-full h-auto object-cover transition-all duration-700 ease-out ${isLoading ? 'opacity-0 scale-105 blur-lg' : 'opacity-100 scale-100 blur-0'}`}
                    onLoadedData={() => setIsLoading(false)}
                    controls={false} // Disable default controls for card view
                    autoPlay
                    muted
                    loop
                />
            ) : (
                <img
                    src={photo.src}
                    alt={photo.alt}
                    className={`w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-105 ${isLoading ? 'opacity-0 scale-105 blur-lg' : 'opacity-100 scale-100 blur-0'}`}
                    loading="lazy"
                    onLoad={() => setIsLoading(false)}
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-bold text-lg">{photo.type === 'video' ? 'Video Moment' : 'Photo Moment'}</p>
                    <p className="text-blue-300 text-sm">Click to view</p>
                </div>
            </div>
        </motion.div>
    )
}

export default GalleryItem
