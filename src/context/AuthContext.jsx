import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Current logged-in user (object or null)
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('current_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [loading, setLoading] = useState(false);

    // Initialize default admin if no users exist
    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.length === 0) {
            const defaultAdmin = { username: 'admin', password: 'admin123' }; // Default credentials
            localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        }
    }, []);

    const login = (username, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            setCurrentUser(user);
            localStorage.setItem('current_user', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('current_user');
        setCurrentUser(null);
    };

    const addUser = (username, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }
        const newUsers = [...users, { username, password }];
        localStorage.setItem('users', JSON.stringify(newUsers));
    };

    const changePassword = (username, newPassword) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(u =>
            u.username === username ? { ...u, password: newPassword } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // Update current session if modifying self
        if (currentUser && currentUser.username === username) {
            const updatedUser = { ...currentUser, password: newPassword };
            setCurrentUser(updatedUser);
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
        }
    };

    const deleteUser = (username) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.length <= 1) {
            throw new Error('Cannot delete the last admin account');
        }
        const newUsers = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(newUsers));
    };

    const getAllUsers = () => {
        return JSON.parse(localStorage.getItem('users') || '[]');
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            isAdmin: !!currentUser, // Compatibility alias
            login,
            logout,
            addUser,
            changePassword,
            deleteUser,
            getAllUsers,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
