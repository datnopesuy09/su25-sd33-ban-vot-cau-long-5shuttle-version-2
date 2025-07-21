import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const fetchUserInfo = async (token) => {
        try {
            const res = await axios.get('http://localhost:8080/users/myInfo', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(res.data.result);
            setIsLoggedIn(true);
        } catch (err) {
            console.error('Lỗi khi lấy thông tin người dùng:', err);
            logoutUser();
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            fetchUserInfo(token);
        }
    }, []);

    const logoutUser = () => {
        localStorage.removeItem('userToken');
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <UserAuthContext.Provider value={{ user, setUser, isLoggedIn, logoutUser, fetchUserInfo }}>
            {children}
        </UserAuthContext.Provider>
    );

};

export const useUserAuth = () => useContext(UserAuthContext);