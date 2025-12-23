import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getAlbums, addAlbum, deleteAlbum, updateAlbum, syncAllAlbumStats } from '../utils/galleryData'
import { useAuth } from '../context/AuthContext'

const Gallery = () => {
    const { isAdmin, logout } = useAuth();
    const [albums, setAlbums] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false) // For Create Album Modal
    const [newAlbumTitle, setNewAlbumTitle] = useState('') // For Create Album Title

    // State for Edit Album Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    // State for Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [albumToDelete, setAlbumToDelete] = useState(null);

    // Initial load
    useEffect(() => {
        const loadAlbums = async () => {
            // Sync stats first to ensure old "X Items" strings are migrated
            await syncAllAlbumStats();
            setAlbums(getAlbums());
        };
        loadAlbums();
    }, []);

    const handleCreateAlbum = async (e) => {
        e.preventDefault();
        try {
            addAlbum({
                title: newAlbumTitle,
                date: new Date().getFullYear(), // Default to current year
                count: '0 Photos' // Initial count
            });
            await syncAllAlbumStats(); // Ensure correct zero-state
            setAlbums(await getAlbums());
            setNewAlbumTitle('');
            setIsModalOpen(false);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = (e, id) => {
        e.preventDefault(); // Stop navigation
        e.stopPropagation();
        const album = albums.find(a => a.id === id);
        if (album) {
            setAlbumToDelete(album);
            setDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (albumToDelete) {
            deleteAlbum(albumToDelete.id);
            await syncAllAlbumStats();
            setAlbums(await getAlbums());
            setDeleteModalOpen(false);
            setAlbumToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setAlbumToDelete(null);
    };

    const openEditModal = (e, album) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingAlbum(album);
        setEditTitle(album.title);
        setIsEditModalOpen(true);
    };

    const handleUpdateAlbum = async (e) => {
        e.preventDefault();
        if (editingAlbum) {
            updateAlbum(editingAlbum.id, {
                title: editTitle,
                date: editingAlbum.date // Keep original date for now, or add date field to edit modal
            });
            await syncAllAlbumStats();
            setAlbums(await getAlbums());
            setIsEditModalOpen(false);
            setEditingAlbum(null);
            setEditTitle('');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Unified Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl relative z-20"
                >
                    {/* Left: Back to Home Button */}
                    <div className="w-full md:w-auto flex justify-start md:flex-1">
                        <Link to="/">
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
                                    Back to Home
                                </span>
                            </motion.button>
                        </Link>
                    </div>

                    {/* Center: Title */}
                    <div className="text-center md:flex-[2]">
                        <h1 className="text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight animate-gradient-x">
                            Event Gallery.
                        </h1>
                        <p className="text-gray-400 text-lg font-medium">Capture moments, create memories forever</p>
                    </div>

                    {/* Right: New Album Button & Auth Status */}
                    <div className="w-full md:w-auto flex justify-center md:justify-end md:flex-1 gap-4">
                        {isAdmin && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="group relative px-6 py-3 bg-white text-black rounded-full font-bold shadow-lg shadow-white/10 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Album
                                </span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map((album) => (
                        <Link to={`/gallery/${album.id}`} key={album.id}>
                            <motion.div
                                className="group relative h-[400px] rounded-3xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-white/10 cursor-pointer"
                                whileHover={{ scale: 1.02, y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Cover Image - Single Grid */}
                                <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                                    <img src={album.cover} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={album.title} />
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                                                {album.stats ? (
                                                    <span>{album.stats.photos} Photos • {album.stats.videos} Videos</span>
                                                ) : (
                                                    album.count
                                                )}
                                            </span>
                                            {album.isDefault && (
                                                <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-xs font-bold text-blue-300 border border-blue-500/20">
                                                    Official
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                                            {album.title}
                                        </h3>
                                        {/* Only show "Empty Folder" if count starts with '0' */}
                                        {!album.isDefault && album.count && album.count.startsWith('0') && (
                                            <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2">Empty Folder</p>
                                        )}
                                        <p className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            {(album.count && !album.count.startsWith('0')) || album.isDefault
                                                ? 'Click to view photos →'
                                                : 'No photos yet'}
                                        </p>
                                    </div>

                                    {/* Edit/Delete Actions - Three Dots Menu */}
                                    {isAdmin && !album.isDefault && (
                                        <div className="absolute bottom-4 right-4 z-30">
                                            <div className="relative group/menu">
                                                <button
                                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-colors"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>

                                                {/* Dropdown Menu */}
                                                <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl transform scale-95 opacity-0 invisible group-hover/menu:visible group-hover/menu:opacity-100 group-hover/menu:scale-100 transition-all duration-200 origin-bottom-right">
                                                    <div className="p-1">
                                                        <button
                                                            onClick={(e) => openEditModal(e, album)}
                                                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(e, album.id)}
                                                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Create Album Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-6 text-white">Create New Album</h2>
                                <form onSubmit={handleCreateAlbum}>
                                    <input
                                        type="text"
                                        placeholder="Album Title"
                                        className="w-full bg-black/30 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all mb-6"
                                        value={newAlbumTitle}
                                        onChange={(e) => setNewAlbumTitle(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-6 py-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!newAlbumTitle.trim()}
                                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Create Album
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Album Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-6 text-white">Edit Album</h2>
                                <form onSubmit={handleUpdateAlbum}>
                                    <input
                                        type="text"
                                        placeholder="Album Title"
                                        className="w-full bg-black/30 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all mb-6"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="px-6 py-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!editTitle.trim()}
                                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModalOpen && albumToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={cancelDelete}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-900/90 border border-red-500/30 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-6 flex justify-center">
                                <div className="p-4 bg-red-500/20 rounded-full text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-2 text-white">Delete Album?</h2>
                            <p className="text-gray-400 mb-8">
                                Are you sure you want to delete <span className="text-white font-semibold">"{albumToDelete.title}"</span>? This action cannot be undone.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={cancelDelete}
                                    className="px-6 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors font-medium border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/25 transition-all"
                                >
                                    Delete Album
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery
