import React, { useState } from "react";
import { FaComments, FaBook, FaChevronLeft, FaChevronRight, FaHome } from "react-icons/fa";
import "./Sidebar.css";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

function Sidebar({ currentProjectId }) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    // 경로 정의 (null 안전 처리)
    const chatPath = currentProjectId ? `/chat/project/${currentProjectId}` : null;
    const resourcesPath = currentProjectId ? `/resources/${currentProjectId}` : null;

    console.log("pathname:", pathname, "chatPath:", chatPath)
    return (
        <nav className={`sidebar${collapsed ? " collapsed" : ""}`}>
            <div className="sidebar-header">
                <span
                    className="sidebar-home-link"
                    onClick={() => navigate("/main")}
                    tabIndex={0}
                    role="button"
                >
                    <FaHome className="sidebar-home-icon" />
                    {!collapsed && <span className="sidebar-title">UREKA</span>}
                </span>
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed((prev) => !prev)}
                    aria-label="네비게이션 축소/확장"
                >
                    {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>

            <ul className="sidebar-menu">
                <li>
                    <NavLink
                        to={chatPath || "#"}
                        className={pathname === chatPath ? "active" : ""}
                        style={!chatPath ? { pointerEvents: "none", opacity: 0.5 } : {}}
                    >
                        <FaComments className="sidebar-icon" />
                        {!collapsed && <span className="sidebar-label">Chat</span>}
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to={resourcesPath || "#"}
                        className={pathname === resourcesPath ? "active" : ""}
                        style={!resourcesPath ? { pointerEvents: "none", opacity: 0.5 } : {}}
                    >
                        <FaBook className="sidebar-icon" />
                        {!collapsed && <span className="sidebar-label">Resources</span>}
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Sidebar;
