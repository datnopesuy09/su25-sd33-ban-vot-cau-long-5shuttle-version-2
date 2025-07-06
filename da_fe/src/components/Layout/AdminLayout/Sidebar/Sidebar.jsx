import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarData } from './SidebarData';
import logo from '../../../Assets/logo.png';

function Sidebar() {
    const location = useLocation();
    const [openSubMenus, setOpenSubMenus] = useState({});

    const toggleSubMenu = (index) => {
        setOpenSubMenus((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return (
        <div className="h-screen w-[250px] bg-white fixed top-0 left-0 transition-all duration-300 shadow-lg overflow-auto pt-5">
            <div className="flex items-center justify-center mb-6">
                <img src={logo} alt="Brand Logo" className="h-[80px] w-[60px] mr-2" />
                <span className="text-3xl font-bold text-gray-800">5Shuttle</span>
            </div>

            <ul className="list-none p-0 m-0">
                {SidebarData.map((item, index) => {
                    try {
                        const isActive =
                            location.pathname === item.link ||
                            (item.subItems &&
                                item.subItems.some((subItem) => subItem.link === location.pathname));

                        const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;

                        return (
                            <React.Fragment key={index}>
                                <li
                                    className={`flex items-center h-[50px] pl-5 mb-2 cursor-pointer transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gray-200 border-l-4 border-x-blue-800 text-gray-800'
                                            : 'bg-white text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                                    onClick={() => {
                                        if (hasSubItems) {
                                            toggleSubMenu(index); // Toggle submenu
                                        } else {
                                            // Navigate to the link if no submenu
                                            window.location.href = item.link; // Navigate to the link
                                        }
                                    }}
                                >
                                    <div className="flex-[20%] text-xl">{item.icon ?? null}</div>
                                    <div className="flex-[80%] text-base">{item.title}</div>
                                </li>

                                {hasSubItems && (
                                    <ul className={`list-none p-0 m-0 ${openSubMenus[index] ? 'block' : 'hidden'}`}>
                                        {item.subItems.map((subItem) => {
                                            const subItemActive = location.pathname === subItem.link;

                                            return (
                                                <li
                                                    className={`flex items-center h-[40px] pl-10 cursor-pointer transition-all duration-300 ${
                                                        subItemActive
                                                            ? 'bg-gray-200 border-l-4 border-x-blue-800 text-gray-800'
                                                            : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                                    }`}
                                                    key={subItem.link}
                                                >
                                                    <Link to={subItem.link} className="flex w-full h-full items-center">
                                                        <div className="text-sm">{subItem.title}</div>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </React.Fragment>
                        );
                    } catch (error) {
                        console.error(`Lỗi khi render sidebar item [${item.title}]:`, error);
                        return (
                            <li key={`error-${index}`} className="text-red-500 pl-5">
                                Lỗi: {error.message}
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
}

export default Sidebar;
