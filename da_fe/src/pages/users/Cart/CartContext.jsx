import React, { createContext, useState } from 'react';

// Tạo CartContext
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItemCount, setCartItemCount] = useState(0);

    return <CartContext.Provider value={{ cartItemCount, setCartItemCount }}>{children}</CartContext.Provider>;
};
