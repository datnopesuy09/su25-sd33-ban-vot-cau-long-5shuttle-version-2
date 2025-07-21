import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [role, setRole] = useState('');

    const fetchAdminInfo = async (token) => {
        try {
            const res = await axios.get('http://localhost:8080/users/myInfo', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAdmin(res.data.result);
            const decoded = parseJwt(token);
            setRole(decoded.scope || '');
        } catch (err) {
            console.error('Lỗi khi lấy thông tin admin:', err);
            logoutAdmin();
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            fetchAdminInfo(token);
        }
    }, []);

    const logoutAdmin = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
        setRole('');
    };

    return (
        <AdminAuthContext.Provider value={{ admin, setAdmin, role, logoutAdmin, fetchAdminInfo }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);