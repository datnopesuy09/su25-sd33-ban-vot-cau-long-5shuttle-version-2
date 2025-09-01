import React, { createContext, useContext, useState } from 'react';

// Create the context
const SidebarContext = createContext();

// Context provider component
export function SidebarProvider({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed((prev) => !prev);
    };

    const value = {
        collapsed,
        setCollapsed,
        toggleSidebar,
        sidebarWidth: collapsed ? 70 : 280,
    };

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// Custom hook to use the sidebar context
export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}

export default SidebarContext;
