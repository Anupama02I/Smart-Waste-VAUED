import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar-panel">
      <div className="sidebar-brand">
        <h2>Smart Waste UI</h2>
        <p>Air quality and odour risk analytics</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          end
        >
          Overview
        </NavLink>

        <NavLink
          to="/risk"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Risk Monitoring
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          Alerts
        </NavLink>

        
      </nav>

      <div className="sidebar-footer">
        <h2>Settings</h2>
      </div>
    </div>
  );
}

export default Sidebar;