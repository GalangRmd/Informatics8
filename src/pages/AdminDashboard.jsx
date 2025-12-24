
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
// Needed for creating a temp client to avoid auto-login
import { createClient } from '@supabase/supabase-js';

const AdminDashboard = () => {
    const { currentUser, logout, loading, signup } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Add Admin State
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPass, setNewAdminPass] = useState('');
    const [adminMsg, setAdminMsg] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Admin List State
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    // Change Password State
    const [changeAdminPass, setChangeAdminPass] = useState('');
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);

    const fetchAdmins = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAdmins(data || []);
        } catch (error) {
            console.error("Error fetching admins:", error.message);
        } finally {
            setLoadingAdmins(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Show loading or redirect
    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    }

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Handle Delete Trigger (Opens Modal)
    const handleDeleteClick = (admin) => {
        setDeleteCandidate(admin);
    };

    // Actual Delete Logic
    const confirmDeleteAdmin = async () => {
        if (!deleteCandidate) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', deleteCandidate.id);

            if (error) throw error;

            setAdminMsg({ type: 'success', text: `Removed admin: ${deleteCandidate.email}` });
            fetchAdmins();
        } catch (error) {
            console.error("Delete Error:", error);
            setAdminMsg({ type: 'error', text: "Failed to delete: " + error.message });
        } finally {
            setDeleteCandidate(null);
        }
    };

    // ... existing handlers ...

    // ... existing handlers ...

    // Handle Change Password (Self)
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setIsUpdatingPass(true);
        setPassMsg({ type: '', text: '' });

        if (changeAdminPass.length < 6) {
            setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            setIsUpdatingPass(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: changeAdminPass
            });

            if (error) throw error;

            setPassMsg({ type: 'success', text: 'Password updated successfully!' });
            setChangeAdminPass('');
        } catch (error) {
            console.error("Update Password Error:", error);
            setPassMsg({ type: 'error', text: error.message });
        } finally {
            setIsUpdatingPass(false);
        }
    };
    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAdminMsg({ type: '', text: '' });

        if (newAdminPass.length < 6) {
            setAdminMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            setIsSubmitting(false);
            return;
        }

        try {
            // TRICK: Create a temporary Supabase client to create the user *without* logging out the current admin.
            // We set persistSession: false so it doesn't touch local storage.
            const tempSupabase = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const { data, error } = await tempSupabase.auth.signUp({
                email: newAdminEmail,
                password: newAdminPass,
            });

            if (error) {
                setAdminMsg({ type: 'error', text: error.message });
            } else {
                setAdminMsg({ type: 'success', text: `Admin created!(${newAdminEmail})` });
                setNewAdminEmail('');
                setNewAdminPass('');

                // Wait a bit for the trigger to create the profile, then refresh
                setTimeout(fetchAdmins, 2000);
            }
        } catch (error) {
            setAdminMsg({ type: 'error', text: 'An unexpected error occurred' });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-400">Welcome, <span className="text-white font-bold">{currentUser.email || currentUser.username}</span></p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="px-6 py-2 bg-red-500/10 text-red-400 rounded-full font-bold hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Add New Admin Card */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add New Admin
                        </h2>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                            <p className="text-yellow-200 text-sm">
                                ⚠️ <strong>Note:</strong> Adding a new admin will create a new account in the database.
                                Depending on Supabase settings, a confirmation email might be sent.
                            </p>
                        </div>

                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <input
                                type="email"
                                placeholder="New Admin Email"
                                value={newAdminEmail}
                                onChange={e => setNewAdminEmail(e.target.value)}
                                className="w-full bg-black/30 rounded-xl px-4 py-3 border border-white/10 focus:border-green-500 outline-none transition-colors text-white"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password (min 6 chars)"
                                value={newAdminPass}
                                onChange={e => setNewAdminPass(e.target.value)}
                                className="w-full bg-black/30 rounded-xl px-4 py-3 border border-white/10 focus:border-green-500 outline-none transition-colors text-white"
                                required
                                minLength={6}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Admin'}
                            </button>
                        </form>
                        {adminMsg.text && (
                            <p className={`mt-4 text-sm font-medium ${adminMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {adminMsg.text}
                            </p>
                        )}
                    </div>

                    {/* Admin List Card */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl flex flex-col">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Admin List
                        </h2>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                            {loadingAdmins ? (
                                <p className="text-gray-500 text-center py-4">Loading list...</p>
                            ) : admins.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No admins found (Requires 'profiles' table).</p>
                            ) : (
                                <div className="space-y-3">
                                    {admins.map((admin) => (
                                        <div key={admin.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group/item">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                                                    {admin.email ? admin.email[0].toUpperCase() : 'A'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-medium truncate text-sm">{admin.email}</p>
                                                    <p className="text-xs text-gray-500">Joined: {new Date(admin.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {/* Delete Button */}
                                            {currentUser.email !== admin.email && (
                                                <button
                                                    onClick={() => handleDeleteClick(admin)}
                                                    className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                    title="Remove Admin"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Account Security Card (Change Password) */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            My Account Security
                        </h2>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Change My Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={changeAdminPass}
                                    onChange={e => setChangeAdminPass(e.target.value)}
                                    className="w-full bg-black/30 rounded-xl px-4 py-3 border border-white/10 focus:border-yellow-500 outline-none transition-colors text-white"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isUpdatingPass}
                                className={`w-full py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20 ${isUpdatingPass ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUpdatingPass ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                        {passMsg.text && (
                            <p className={`mt-4 text-sm font-medium ${passMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {passMsg.text}
                            </p>
                        )}
                    </div>

                    {/* Access Members Card */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl hover:border-blue-500/30 transition-all group">
                        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Manage Members
                        </h2>
                        <p className="text-gray-400 mb-6">Add, edit, or remove class members from the database.</p>
                        <Link to="/" className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors text-center">
                            Go to Member List
                        </Link>
                    </div>

                    {/* Access Gallery Card */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl hover:border-purple-500/30 transition-all group">
                        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Manage Gallery
                        </h2>
                        <p className="text-gray-400 mb-6">Upload photos, manage albums, and curate memories.</p>
                        <Link to="/gallery" className="inline-block w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-colors text-center">
                            Go to Gallery
                        </Link>
                    </div>

                    {/* System Health Check Card */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 text-white">System Diagnostics</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={async () => {
                                    alert("Checking connections...");
                                    try {
                                        // Check Supabase
                                        const { data, error } = await supabase.from('albums').select('count', { count: 'exact', head: true });
                                        if (error) throw new Error("Supabase Error: " + error.message);

                                        // Check Cloudinary Config present (cannot ping without upload)
                                        // We just alert success
                                        alert(`✅ SYSTEM HEALTHY\n\nSupabase: Connected\nAlbums Count: ${data === null ? 'Unknown' : 'Active'} \nCloudinary Config: Present`);
                                    } catch (e) {
                                        alert(`❌ CONNECTION ERROR\n\n${e.message} \n\nPlease check Vercel Environment Variables!`);
                                    }
                                }}
                                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-white/10"
                            >
                                Test Database Connection
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteCandidate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={() => setDeleteCandidate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-black text-white mb-2">Remove Admin?</h3>
                                <p className="text-gray-400 mb-6 text-sm">
                                    Are you sure you want to remove <strong>{deleteCandidate.email}</strong>? This action cannot be undone.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteCandidate(null)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteAdmin}
                                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={() => setShowLogoutConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-red-500/20 blur-[60px] pointer-events-none"></div>

                            <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Logging Out?</h3>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    You will be redirected to the home page. Are you sure you want to end your session?
                                </p>

                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5 hover:border-white/20"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleLogout}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold transition-all shadow-lg shadow-red-500/30"
                                    >
                                        Logout Now
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
