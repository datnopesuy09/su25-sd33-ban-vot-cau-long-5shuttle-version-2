import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SidebarData } from './SidebarData';
import logo from '../../../Assets/logo.png';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import './Sidebar.css';

function Sidebar({ collapsed, setCollapsed }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [openSubMenus, setOpenSubMenus] = useState({});

    const toggleSubMenu = (index) => {
        setOpenSubMenus((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    // Auto-open submenu containing current path
    useEffect(() => {
        SidebarData.forEach((item, idx) => {
            if (item.subItems && item.subItems.some((s) => s.link === location.pathname)) {
                setOpenSubMenus((prev) => ({ ...prev, [idx]: true }));
            }
        });
    }, [location.pathname]);

    const handleItemClick = (item, index, hasSubItems) => {
        if (hasSubItems) {
            toggleSubMenu(index);
        } else if (item.link) {
            navigate(item.link);
        }
    };

    return (
        <div
            className={`h-screen ${collapsed ? 'w-[70px]' : 'w-[280px]'} 
                        bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                        backdrop-blur-xl border-r border-blue-200/60 
                        fixed top-0 left-0 transition-all duration-500 ease-in-out 
                        shadow-2xl shadow-blue-200/40 overflow-hidden z-50
                        before:absolute before:inset-0 before:bg-gradient-to-b 
                        before:from-blue-400/8 before:via-transparent before:to-indigo-400/8
                        before:opacity-50`}
            style={{
                background: 'linear-gradient(145deg, rgba(240, 249, 255, 0.95), rgba(245, 247, 255, 0.95))',
                backdropFilter: 'blur(20px)',
                borderImage: 'linear-gradient(180deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2)) 1',
            }}
        >
            {/* Header with logo and toggle */}
            <div
                className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-5'} py-6 
                           border-b border-blue-200/50 bg-gradient-to-r from-blue-100/60 to-indigo-100/60 
                           backdrop-blur-sm relative overflow-hidden`}
            >
                <div className="flex items-center gap-3">
                    <div className={`relative transition-all duration-500 ${collapsed ? 'scale-90' : 'scale-100'}`}>
                        <img
                            src={logo}
                            alt="Brand Logo"
                            className={`transition-all duration-500 drop-shadow-lg 
                                      ${collapsed ? 'h-8 w-6' : 'h-12 w-9'}`}
                        />
                        <div className="absolute inset-0 bg-blue-400/15 blur-xl rounded-full animate-pulse"></div>
                    </div>
                    {!collapsed && (
                        <div className="relative">
                            <span className="text-2xl font-black tracking-wider text-gray-800 drop-shadow-sm">
                                5Shuttle
                            </span>
                            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        </div>
                    )}
                </div>

                <button
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-2.5 rounded-xl bg-white/80 hover:bg-white/95 
                              text-gray-600 hover:text-blue-600 transition-all duration-300 
                              border border-blue-200/60 hover:border-blue-400/60
                              focus:outline-none focus:ring-2 focus:ring-blue-400/40 
                              backdrop-blur-sm group shadow-sm hover:shadow-md ${collapsed ? 'mx-auto' : ''}`}
                >
                    <div className="relative">
                        {collapsed ? (
                            <MenuIcon
                                fontSize="small"
                                className="transition-transform duration-300 group-hover:scale-110"
                            />
                        ) : (
                            <MenuOpenIcon
                                fontSize="small"
                                className="transition-transform duration-300 group-hover:scale-110"
                            />
                        )}
                    </div>
                </button>
            </div>

            {/* Navigation Menu */}
            <div className={`h-[calc(100vh-120px)] overflow-y-auto px-3 py-4 tech-sidebar ${collapsed ? 'px-2' : ''}`}>
                <ul className="list-none space-y-1 select-none">
                    {SidebarData.map((item, index) => {
                        try {
                            const isActive =
                                location.pathname === item.link ||
                                (item.subItems && item.subItems.some((subItem) => subItem.link === location.pathname));

                            const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;

                            return (
                                <React.Fragment key={index}>
                                    <li
                                        className={`relative group/item cursor-pointer transition-all duration-300 ease-out hover-lift
                                                  ${collapsed ? 'mx-1' : 'mx-0'}`}
                                        onClick={() => handleItemClick(item, index, hasSubItems)}
                                        aria-expanded={hasSubItems ? !!openSubMenus[index] : undefined}
                                        aria-haspopup={hasSubItems || undefined}
                                        role="button"
                                    >
                                        {/* Glow effect for active item */}
                                        {isActive && (
                                            <div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-400/15 to-indigo-400/15 
                                                          rounded-xl blur-sm pulse-glow"
                                            ></div>
                                        )}

                                        <div
                                            className={`relative flex items-center h-[52px] 
                                                       ${collapsed ? 'px-3 justify-center' : 'px-4'} 
                                                       rounded-xl transition-all duration-300 group/item tech-focus
                                                       ${
                                                           isActive
                                                               ? 'bg-gradient-to-r from-blue-500/15 via-indigo-500/12 to-blue-500/15 text-blue-600 shadow-lg shadow-blue-200/30 border border-blue-300/40 active-glow'
                                                               : 'text-gray-600 hover:bg-blue-50/70 hover:text-blue-700 hover:shadow-md hover:shadow-blue-100/40 border border-transparent hover:border-blue-200/40'
                                                       }`}
                                        >
                                            {/* Active indicator - modern line */}
                                            <span
                                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full 
                                                            transition-all duration-500 ease-out
                                                            ${
                                                                isActive
                                                                    ? 'bg-gradient-to-b from-blue-500 to-indigo-500 scale-y-100 opacity-100'
                                                                    : 'bg-blue-300 scale-y-0 opacity-0 group-hover/item:scale-y-50 group-hover/item:opacity-60'
                                                            }`}
                                            ></span>

                                            {/* Icon with glow effect */}
                                            <div
                                                className={`relative flex items-center justify-center 
                                                           ${collapsed ? 'w-full' : 'w-10'} 
                                                           text-[24px] transition-all duration-300
                                                           ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover/item:text-blue-600'}`}
                                            >
                                                {item.icon}
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-blue-400/20 rounded-lg blur-lg"></div>
                                                )}
                                            </div>

                                            {/* Title and expand arrow */}
                                            {!collapsed && (
                                                <div className="flex-1 flex items-center justify-between ml-3">
                                                    <span
                                                        className={`font-medium text-[15px] tracking-wide transition-all duration-300
                                                                    ${isActive ? 'text-gray-800 font-semibold' : 'text-gray-600 group-hover/item:text-gray-800'}`}
                                                    >
                                                        {item.title}
                                                    </span>
                                                    {hasSubItems && (
                                                        <div
                                                            className={`transition-all duration-300 expand-collapse
                                                                       ${openSubMenus[index] ? 'rotate-180' : 'rotate-0'}
                                                                       ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover/item:text-blue-500'}`}
                                                        >
                                                            <ExpandMoreIcon fontSize="small" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Tooltip for collapsed mode */}
                                            {collapsed && <div className="tooltip">{item.title}</div>}
                                        </div>
                                    </li>

                                    {/* Submenu with modern styling */}
                                    {hasSubItems && (
                                        <li
                                            className={`overflow-hidden transition-all duration-500 ease-in-out expand-collapse
                                                      ${openSubMenus[index] && !collapsed ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className={`${collapsed ? 'hidden' : 'block'} pt-2 pb-1`}>
                                                <ul className="space-y-1 ml-4 pl-4 border-l border-blue-300/40 relative">
                                                    {/* Animated line indicator for submenu */}
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/60 to-indigo-400/60 
                                                                   animated-border"
                                                    ></div>

                                                    {item.subItems.map((subItem, subIndex) => {
                                                        const subItemActive = location.pathname === subItem.link;
                                                        return (
                                                            <li
                                                                key={subItem.link}
                                                                className="submenu-item hover-lift"
                                                                style={{
                                                                    animationDelay: `${subIndex * 100}ms`,
                                                                }}
                                                            >
                                                                <Link
                                                                    to={subItem.link}
                                                                    className={`relative flex items-center h-[42px] px-4 rounded-lg 
                                                                              transition-all duration-300 group/sub overflow-hidden tech-focus
                                                                              ${
                                                                                  subItemActive
                                                                                      ? 'bg-gradient-to-r from-blue-400/20 to-indigo-400/15 text-blue-700 shadow-md shadow-blue-100/40 border border-blue-300/30 active-glow'
                                                                                      : 'text-gray-500 hover:bg-blue-50/60 hover:text-blue-600 border border-transparent hover:border-blue-200/30'
                                                                              }`}
                                                                >
                                                                    {/* Background glow for active submenu */}
                                                                    {subItemActive && (
                                                                        <div
                                                                            className="absolute inset-0 bg-gradient-to-r from-blue-400/8 to-indigo-400/8 
                                                                                       pulse-glow"
                                                                        ></div>
                                                                    )}

                                                                    {/* Animated dot indicator */}
                                                                    <div className="relative flex items-center mr-3">
                                                                        <FiberManualRecordIcon
                                                                            className={`text-[8px] transition-all duration-300
                                                                                      ${
                                                                                          subItemActive
                                                                                              ? 'text-blue-600 scale-125'
                                                                                              : 'text-gray-400 scale-100 group-hover/sub:text-blue-500 group-hover/sub:scale-110'
                                                                                      }`}
                                                                            fontSize="inherit"
                                                                        />
                                                                        {subItemActive && (
                                                                            <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-sm animate-ping"></div>
                                                                        )}
                                                                    </div>

                                                                    <span
                                                                        className={`relative text-[14px] font-medium tracking-wide truncate
                                                                                    ${subItemActive ? 'text-gray-800' : 'text-gray-600 group-hover/sub:text-gray-800'}`}
                                                                    >
                                                                        {subItem.title}
                                                                    </span>

                                                                    {/* Hover effect line */}
                                                                    <div
                                                                        className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-blue-500 to-indigo-500 
                                                                                   transition-all duration-300 origin-left
                                                                                   ${subItemActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover/sub:scale-x-100 group-hover/sub:opacity-60'}`}
                                                                    ></div>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </li>
                                    )}
                                </React.Fragment>
                            );
                        } catch (error) {
                            console.error(`Lỗi khi render sidebar item [${item.title}]:`, error);
                            return (
                                <li
                                    key={`error-${index}`}
                                    className="text-red-400 pl-5 py-2 bg-red-500/10 rounded-lg border border-red-500/20"
                                >
                                    <span className="text-sm font-medium">Lỗi: {error.message}</span>
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-50 via-blue-50/80 to-transparent pointer-events-none"></div>
        </div>
    );
}

export default Sidebar;
