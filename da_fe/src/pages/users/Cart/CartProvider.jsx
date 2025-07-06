import React, { createContext, useState } from 'react';

// Tạo CartContext
export const CartContext = createContext();

// Tạo CartProvider để bọc toàn bộ ứng dụng
export const CartProvider = ({ children }) => {
    const [cartItemCount, setCartItemCount] = useState(0); // Khởi tạo state

    return <CartContext.Provider value={{ cartItemCount, setCartItemCount }}>{children}</CartContext.Provider>;
};
