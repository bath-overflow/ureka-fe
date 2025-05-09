import React, { useState } from "react";
import { FaComments, FaLayerGroup, FaBook, FaChevronLeft, FaChevronRight, FaHome } from "react-icons/fa";
import "./Sidebar.css";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

function Sidebar({ currentProjectId }) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isChatActive = location.pathname.startsWith("/chat/project/");

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
                        to={currentProjectId ? `/chat/project/${currentProjectId}` : "/main"}
                        className={isChatActive ? "active" : ""}
                    >
                        <FaComments className="sidebar-icon" />
                        {!collapsed && <span className="sidebar-label">Chat</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/debate" className={({ isActive }) => isActive ? "active" : ""}>
                        <FaLayerGroup className="sidebar-icon" />
                        {!collapsed && <span className="sidebar-label">In-depth Debate</span>}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to={currentProjectId ? `/resources/${currentProjectId}` : "#"}
                        className={({ isActive }) => isActive ? "active" : ""}
                        style={!currentProjectId ? { pointerEvents: "none", opacity: 0.5 } : {}}
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