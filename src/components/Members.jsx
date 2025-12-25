import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Instagram, Calendar, IdCard, User, Trash2, Edit2, Save, AlertTriangle, Loader2, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { uploadImage } from '../utils/cloudinaryConfig'
import { supabase } from '../lib/supabaseClient'

// Initial members data (kept for reference or fallback, but actual seeding uses utils/seedMembers.js)
const initialMembersList = [
    "Adi Tiya Yudha Peratama", "Arpi Samsul Anwar", "Bina Muhammad",
    "Christian Imanuel Ringu Langu", "Danendra Saputra", "David Riko Setiawan", "Erick Eka Prasetya",
    "Fakhri Sofyan", "Firli Fadilah Firdaus", "Galang Ramadhan", "Ghildan Nafhan Ramadhan",
    "Hagi Algi Ziad", "Hiqmal Fajryan Anwar", "Kelvin Rafael Suchyarwan", "Ksatria Faikar Nasywaan",
    "M Rafly Aryanu", "Mas Syahid Kanzul Arasy", "Muhammad Zhafir Rifqiansyah", "Naila Murni Cahyani",
    "Omar Abdullah Ali Ahmed", "Raafli Akbarfebruansyah Muchtar", "Rakha Zaidan Rizqulloh",
    "Rangga Syatir Heriza", "Rayhan Zulfikar Putra Pamungkas", "Refi Anggana Afrianto",
    "Revan Kurniawan", "Ridwan Farid Maulana", "Rifqi Athallah", "Ripan Maulana Suhur",
    "Risma Ayu Khadijah", "Rizky Fernando", "Rycko Fathur Octavian Sakti Arizona",
    "Sandy Dwi Cahyo Nugroho", "Sayyid Azfa Rasikh Dyani", "Sebastian Fikran Alhanif",
    "Tazkiya Fitriya", "Thifal Ghailan Baihaqi", "Wilda Khoeirul Anam", "Yoana Briliant Maharani",
    "Yusuf Rizqi Aulia", "Zahratul Jannah Afnur"
]

const Members = () => {
    // Sort helper
    const sortMembers = (list) => {
        return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    const [members, setMembers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const auth = useAuth()
    const isAdmin = auth?.isAdmin || false

    const fetchMembers = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setMembers(data || [])
        } catch (error) {
            console.error('Error fetching members:', error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchMembers()
    }, [])

    const handleAddMember = async (newMemberBackend) => {
        try {
            const { data, error } = await supabase
                .from('members')
                .insert([newMemberBackend])
                .select()

            if (error) throw error

            if (data) {
                setMembers(sortMembers([...members, data[0]]))
                setIsAddModalOpen(false)
            }
        } catch (error) {
            alert('Error adding member: ' + error.message)
        }
    }

    const handleDeleteMember = async (id) => {
        try {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', id)

            if (error) throw error

            const updatedMembers = members.filter(m => m.id !== id)
            setMembers(updatedMembers)
            setSelectedMember(null)
        } catch (error) {
            alert('Error deleting member: ' + error.message)
        }
    }

    const handleUpdateMember = async (updatedMember) => {
        try {
            const { error } = await supabase
                .from('members')
                .update({
                    name: updatedMember.name,
                    nim: updatedMember.nim,
                    dob: updatedMember.dob,
                    instagram: updatedMember.instagram,
                    photo: updatedMember.photo
                })
                .eq('id', updatedMember.id)

            if (error) throw error

            let updatedMembers = members.map(m => m.id === updatedMember.id ? updatedMember : m)
            updatedMembers = sortMembers(updatedMembers)
            setMembers(updatedMembers)
            setSelectedMember(updatedMember)
        } catch (error) {
            alert('Error updating member: ' + error.message)
        }
    }

    return (
        <section className="min-h-screen py-20 px-4 md:px-10 relative bg-black" id="members">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 relative"
                >
                    <h2 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 inline-block mb-4">
                        Our Members
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Meet the diverse and talented individuals that make up Informatics 8.
                    </p>

                    {/* Admin Add Button */}
                    {isAdmin && (
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-all flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Add Member
                            </button>
                            <button
                                onClick={() => import('../utils/seedMembers').then(m => m.seedMembers())}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-all flex items-center gap-2"
                            >
                                <Save size={20} />
                                Seed Database (Initial)
                            </button>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.05 }
                        }
                    }}
                    className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-center max-w-5xl mx-auto"
                >
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center w-full py-20">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                            <p className="text-gray-400">Loading members...</p>
                        </div>
                    )}

                    {!isLoading && members.map((member, index) => (
                        <motion.span
                            key={member.id}
                            variants={{
                                hidden: { opacity: 0, scale: 0 },
                                visible: {
                                    opacity: 1,
                                    scale: 1,
                                    transition: { type: "spring", stiffness: 300, damping: 20 }
                                }
                            }}
                            whileHover={{ scale: 1.1, originX: 0.5 }}
                            onClick={() => setSelectedMember(member)}
                            className="relative group text-white/60 font-medium text-lg md:text-xl tracking-wide hover:text-white transition-colors cursor-pointer inline-block"
                        >
                            {member.name}

                            {/* Tooltip */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 text-xs font-bold text-white bg-purple-600/30 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-10">
                                Click to get more information
                            </span>

                            {index < members.length - 1 && (
                                <span className="text-purple-500 mx-2">-</span>
                            )}
                        </motion.span>
                    ))}
                </motion.div>
            </div>

            {/* Member Detail Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <MemberModal
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                        onDelete={() => handleDeleteMember(selectedMember.id)}
                        onUpdate={handleUpdateMember}
                        isAdmin={isAdmin}
                    />
                )}
            </AnimatePresence>

            {/* Add Member Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <AddMemberModal
                        onClose={() => setIsAddModalOpen(false)}
                        onAdd={(data) => handleAddMember(data)}
                    />
                )}
            </AnimatePresence>
        </section>
    )
}

// Internal Crop Modal Component
const CropModal = ({ imageSrc, onCancel, onCrop }) => {
    const [zoom, setZoom] = useState(1)
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Touch/Mouse Handlers (Reused logic)
    const handleMouseDown = (e) => {
        e.preventDefault()
        setIsDragging(true)
        setDragStart({ x: e.clientX - dragPos.x, y: e.clientY - dragPos.y })
    }
    const handleMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()
        setDragPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
    const handleMouseUp = () => setIsDragging(false)

    // Touch
    const handleTouchStart = (e) => {
        const touch = e.touches[0]
        setIsDragging(true)
        setDragStart({ x: touch.clientX - dragPos.x, y: touch.clientY - dragPos.y })
    }
    const handleTouchMove = (e) => {
        if (!isDragging) return
        const touch = e.touches[0]
        setDragPos({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
    }

    const performCrop = async () => {
        const img = new Image()
        img.src = imageSrc
        img.crossOrigin = 'anonymous'
        await new Promise(r => img.onload = r)

        const canvas = document.createElement('canvas')
        const size = 500 // Higher resolution for final crop
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        // Render Logic matching the Preview
        // Preview is 256px (w-64).
        const PREVIEW_SIZE = 256
        const pixelScale = size / PREVIEW_SIZE

        // Calculate Image dimensions in Preview
        const aspect = img.naturalWidth / img.naturalHeight
        let renderW, renderH
        if (aspect > 1) {
            renderH = PREVIEW_SIZE
            renderW = PREVIEW_SIZE * aspect
        } else {
            renderW = PREVIEW_SIZE
            renderH = PREVIEW_SIZE / aspect
        }

        // Apply Zoom
        renderW *= zoom
        renderH *= zoom

        // Draw Center + Offset
        let drawX = (size - (renderW * pixelScale)) / 2
        let drawY = (size - (renderH * pixelScale)) / 2

        // DragPos is in DOM pixels relative to preview. Scale up.
        drawX += dragPos.x * pixelScale
        drawY += dragPos.y * pixelScale

        ctx.drawImage(img, drawX, drawY, renderW * pixelScale, renderH * pixelScale)

        canvas.toBlob((blob) => {
            onCrop(blob)
        }, 'image/jpeg', 0.95)
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center">
                <h3 className="text-xl font-bold text-white mb-4">Crop Profile Photo</h3>

                {/* Crop Area */}
                <div className="relative w-64 h-64 bg-black rounded-lg overflow-hidden border-2 border-dashed border-zinc-700 mb-6 touch-none">
                    {/* Image Layer */}
                    <div
                        className="absolute inset-0 cursor-move"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                    >
                        <img
                            src={imageSrc}
                            alt="Crop Target"
                            className="absolute max-w-none pointer-events-none select-none"
                            style={{
                                top: '50%',
                                left: '50%',
                                minWidth: '100%',
                                minHeight: '100%',
                                transform: `translate(calc(-50% + ${dragPos.x}px), calc(-50% + ${dragPos.y}px)) scale(${zoom})`,
                            }}
                        />
                    </div>

                    {/* Circular Mask Overlay - Shows what will be cropped */}
                    <div className="absolute inset-0 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] rounded-full m-1 border-2 border-white/50"></div>
                </div>

                {/* Controls */}
                <div className="w-full space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-400">Zoom</span>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={e => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={performCrop}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
                    >
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    )
}

const MemberModal = ({ member, onClose, onDelete, onUpdate, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editData, setEditData] = useState({ ...member })
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    // Crop Modal State
    const [showCropModal, setShowCropModal] = useState(false)
    const [rawPhotoUrl, setRawPhotoUrl] = useState(null)

    const handleSave = async () => {
        try {
            setUploading(true)
            let photoUrl = editData.photo

            // If we have a file (it's already cropped by the modal flow), upload it
            if (selectedFile) {
                photoUrl = await uploadImage(selectedFile)
            }

            onUpdate({ ...editData, photo: photoUrl })
            setIsEditing(false)
            setSelectedFile(null)
        } catch (error) {
            alert('Failed to update member: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            setRawPhotoUrl(url)
            setShowCropModal(true)
            // We don't set selectedFile yet. We wait for crop.
        }
    }

    const handleCropFinished = (croppedBlob) => {
        const croppedUrl = URL.createObjectURL(croppedBlob)
        setEditData({ ...editData, photo: croppedUrl })
        setSelectedFile(croppedBlob) // This blob is ready to upload
        setShowCropModal(false)
        setRawPhotoUrl(null)
    }

    // Reset states when member changes
    useEffect(() => {
        setIsEditing(false)
        setShowDeleteConfirm(false)
        setShowCropModal(false)
        setRawPhotoUrl(null)
        setEditData({ ...member })
        setSelectedFile(null)
    }, [member])

    return (
        <>
            {showCropModal && rawPhotoUrl && (
                <CropModal
                    imageSrc={rawPhotoUrl}
                    onCancel={() => {
                        setShowCropModal(false)
                        setRawPhotoUrl(null)
                    }}
                    onCrop={handleCropFinished}
                />
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Delete Confirmation Overlay */}
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 bg-zinc-900/95 backdrop-blur flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Delete Member?</h3>
                                <p className="text-zinc-400 mb-6">
                                    Are you sure you want to delete <span className="text-white font-semibold">{member.name}</span>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onDelete}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header/Cover */}
                    <div className="h-32 bg-black relative flex items-center justify-center overflow-hidden border-b border-zinc-800">
                        {/* 3D Text Banner */}
                        <h1
                            className="text-5xl font-black italic uppercase tracking-widest glossy-text transform -rotate-6 opacity-90 translate-y-1 relative z-10"
                        >
                            Informatics 8
                        </h1>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        {isAdmin && !isEditing && (
                            <div className="absolute top-4 left-4 flex gap-2 z-10">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Content */}
                    <div className="px-6 pb-8 -mt-16 text-center">
                        <div className="flex flex-col items-center">
                            <div className="relative inline-block group">
                                <div
                                    className={`w-32 h-32 rounded-full border-4 border-zinc-900 bg-zinc-800 relative overflow-hidden mb-4 shadow-xl ${isEditing ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : ''}`}
                                >
                                    {isEditing ? (
                                        <>
                                            {editData.photo ? (
                                                <img
                                                    src={editData.photo}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                                                    <Upload size={24} />
                                                </div>
                                            )}

                                            {/* Hidden Input for Upload - Always present to allow clicking to change/add */}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                title="Change Photo"
                                            />
                                        </>
                                    ) : (
                                        member.photo ? (
                                            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-zinc-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        )
                                    )}
                                </div>

                                {/* Change/Remove Photo Buttons */}
                                {isEditing && (
                                    <div className="space-y-2 mb-6 w-full max-w-[200px]">
                                        {editData.photo && (
                                            <button
                                                onClick={() => setEditData({ ...editData, photo: '' })}
                                                className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center justify-center gap-1 w-full py-1 bg-red-500/10 rounded"
                                            >
                                                <Trash2 size={12} /> Remove Photo
                                            </button>
                                        )}
                                        <div className="text-xs text-zinc-500">Tap circle to change photo</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-800 border-none rounded p-2 text-white font-bold text-center text-xl"
                                    placeholder="Name"
                                />
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                                <p className="text-purple-400 text-sm mb-6">Informatics 8 Member</p>
                            </>
                        )}

                        <div className="space-y-4 text-left bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-3 text-zinc-300">
                                <IdCard size={18} className="text-blue-500" />
                                <div className="w-full">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">NIM</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="nim"
                                            value={editData.nim}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-800 rounded p-1 text-white text-sm"
                                        />
                                    ) : (
                                        <p className="font-mono">{member.nim || '-'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-zinc-300">
                                <Calendar size={18} className="text-pink-500" />
                                <div className="w-full">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Born</p>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="dob"
                                            value={editData.dob && editData.dob !== '-' ? editData.dob : ''}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-800 rounded p-1 text-white text-sm"
                                        />
                                    ) : (
                                        <p>{member.dob || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <Instagram size={18} className="text-purple-500" />
                                    <div className="w-full">
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Instagram</p>
                                        <input
                                            type="text"
                                            name="instagram"
                                            value={editData.instagram}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-800 rounded p-1 text-white text-sm"
                                            placeholder="@username"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={uploading}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {uploading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        ) : (
                            member.instagram && (
                                <a
                                    href={member.instagram.startsWith('http') ? member.instagram : `https://instagram.com/${member.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-900/20"
                                >
                                    <Instagram size={20} />
                                    Visit Instagram
                                </a>
                            )
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    )
}

const AddMemberModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        nim: '',
        dob: '',
        instagram: '',
        photo: ''
    })
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    const [showCropModal, setShowCropModal] = useState(false)
    const [rawPhotoUrl, setRawPhotoUrl] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setUploading(true)
            let photoUrl = formData.photo

            if (selectedFile) {
                photoUrl = await uploadImage(selectedFile)
            }

            const newMember = {
                ...formData,
                photo: photoUrl
                // ID handled by Supabase
            }
            onAdd(newMember)
        } catch (error) {
            alert('Failed to add member: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            setRawPhotoUrl(url)
            setShowCropModal(true)
        }
    }

    const handleCropFinished = (croppedBlob) => {
        const croppedUrl = URL.createObjectURL(croppedBlob)
        setFormData({ ...formData, photo: croppedUrl })
        setSelectedFile(croppedBlob)
        setShowCropModal(false)
        setRawPhotoUrl(null)
    }

    return (
        <>
            {showCropModal && rawPhotoUrl && (
                <CropModal
                    imageSrc={rawPhotoUrl}
                    onCancel={() => {
                        setShowCropModal(false)
                        setRawPhotoUrl(null)
                    }}
                    onCrop={handleCropFinished}
                />
            )}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h3 className="text-2xl font-bold text-white mb-6">Add New Member</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-zinc-400 block mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-zinc-400 block mb-1">NIM</label>
                                <input
                                    type="text"
                                    name="nim"
                                    value={formData.nim}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="12345678"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-zinc-400 block mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-zinc-400 block mb-1">Instagram Username/Link</label>
                            <input
                                type="text"
                                name="instagram"
                                value={formData.instagram}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="@username"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-zinc-400 block mb-1">Photo</label>
                            <div className="relative w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden group hover:border-purple-500 transition-colors">
                                {formData.photo ? (
                                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-500">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs">Click to upload</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading && <Loader2 size={20} className="animate-spin" />}
                            {uploading ? 'Uploading...' : 'Save Member'}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </>
    )
}

export default Members
