import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import HeaderAdmin from './HeaderAdmin/HeaderAdmin';
import './Sidebar/Sidebar.css';

function AdminLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const sidebarWidth = sidebarCollapsed ? 70 : 280;

    return (
        <div className="flex w-screen h-screen overflow-hidden">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <div
                className="flex-1 min-w-0 flex flex-col bg-white overflow-y-auto main-content"
                style={{
                    marginLeft: `${sidebarWidth}px`,
                    width: `calc(100vw - ${sidebarWidth}px)`,
                }}
            >
                <HeaderAdmin />
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="max-w-screen-xl mx-auto bg-white rounded-lg">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
