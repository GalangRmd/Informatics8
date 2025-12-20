import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { currentUser, changePassword, addUser, deleteUser, getAllUsers, logout } = useAuth();
    const navigate = useNavigate();

    // Change Password State
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    // Add User State
    const [newUserUser, setNewUserUser] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [userMsg, setUserMsg] = useState({ type: '', text: '' });

    // List Users State
    const [users, setUsers] = useState(getAllUsers());
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


    // Redirect if not logged in
    if (!currentUser) {
        navigate('/');
        return null;
    }

    // ... (existing handlers)



    const handleChangePassword = (e) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            setPassMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (newPass.length < 4) {
            setPassMsg({ type: 'error', text: 'Password too short' });
            return;
        }
        changePassword(currentUser.username, newPass);
        setPassMsg({ type: 'success', text: 'Password updated successfully!' });
        setNewPass('');
        setConfirmPass('');
        // Refresh users list if needed
        setUsers(getAllUsers());
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        if (!newUserUser || !newUserPass) return;
        try {
            addUser(newUserUser, newUserPass);
            setUserMsg({ type: 'success', text: `User ${newUserUser} created!` });
            setNewUserUser('');
            setNewUserPass('');
            setUsers(getAllUsers());
        } catch (error) {
            setUserMsg({ type: 'error', text: error.message });
        }
    };

    const handleDeleteUser = (username) => {
        if (window.confirm(`Delete user "${username}"?`)) {
            try {
                deleteUser(username);
                setUsers(getAllUsers());
            } catch (error) {
                alert(error.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background elements similar to other pages */}
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
                                Dashboard
                            </h1>
                            <p className="text-gray-400">Welcome, <span className="text-white font-bold">{currentUser.username}</span></p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Change Password Card */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Change My Password
                        </h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                className="w-full bg-black/30 rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 outline-none transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                className="w-full bg-black/30 rounded-xl px-4 py-3 border border-white/10 focus:border-blue-500 outline-none transition-colors"
                            />
                            {passMsg.text && (
                                <p className={`text-sm ${passMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                    {passMsg.text}
                                </p>
                            )}
                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-colors">
                                Update Password
                            </button>
                        </form>
                    </div>

                    {/* Manage Users Card */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Manage Admins
                        </h2>

                        {/* Add User Form */}
                        <form onSubmit={handleAddUser} className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Add New Admin</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newUserUser}
                                    onChange={e => setNewUserUser(e.target.value)}
                                    className="bg-black/30 rounded-lg px-3 py-2 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUserPass}
                                    onChange={e => setNewUserPass(e.target.value)}
                                    className="bg-black/30 rounded-lg px-3 py-2 border border-white/10 focus:border-purple-500 outline-none text-sm"
                                />
                            </div>
                            {userMsg.text && (
                                <p className={`text-xs mb-3 ${userMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                    {userMsg.text}
                                </p>
                            )}
                            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-sm transition-colors">
                                Create Account
                            </button>
                        </form>

                        {/* User List */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {users.map(user => (
                                <div key={user.username} className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <span className="font-medium">{user.username}</span>
                                        {user.username === currentUser.username && (
                                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">You</span>
                                        )}
                                    </div>
                                    {users.length > 1 && (
                                        <button
                                            onClick={() => handleDeleteUser(user.username)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete User"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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
                            {/* Decorative background glow */}
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
                                        onClick={logout}
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
