import React, { useState } from "react";
import { FaComments, FaLayerGroup, FaBook, FaChevronLeft, FaChevronRight, FaHome } from "react-icons/fa";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

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
                <li className="active">
                    <FaComments className="sidebar-icon" />
                    {!collapsed && <span className="sidebar-label">Chat</span>}
                </li>
                <li>
                    <FaLayerGroup className="sidebar-icon" />
                    {!collapsed && <span className="sidebar-label">In-depth Debate</span>}
                </li>
                <li>
                    <FaBook className="sidebar-icon" />
                    {!collapsed && <span className="sidebar-label">Resources</span>}
                </li>
            </ul>
        </nav>
    );
}

export default Sidebar;