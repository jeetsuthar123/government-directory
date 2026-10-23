import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  Blocks,
  Building2,
  ChevronLeft,
  ChevronRight,
  Command,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  ShieldCheck,
  Users,
  X,
  Landmark,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { resourceConfigs } from "../config/resources";

const iconMap: Record<string, typeof Building2> = {
  "building-2": Building2,
  "map-pinned": MapPinned,
  map: Blocks,
  landmark: Landmark,
  "badge-check": BadgeCheck,
  users: Users,
  "shield-check": ShieldCheck,
};

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentConfig = resourceConfigs.find(
    (c) => location.pathname === `/${c.key}`,
  );
  const title =
    currentConfig?.label ||
    (location.pathname === "/" ? "Dashboard" : "Directory management");

  const logout = () => {
    signOut();
    navigate("/login", { replace: true });
  };
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`;
  const sidebar = (
    <aside
      className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "sidebar-mobile-open" : ""}`}
    >
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Building2 size={22} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <strong>GovDirectory</strong>
            <span>Admin workspace</span>
          </div>
        )}
        <button
          className="mobile-close icon-button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={19} />
        </button>
      </div>
      <div className="workspace-label">{!collapsed && "WORKSPACE"}</div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={navLinkClass}
          onClick={() => setMobileOpen(false)}
          title="Dashboard"
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>
        <div className="nav-section-label">{!collapsed && "DIRECTORY"}</div>
        {resourceConfigs
          .filter((c) => c.key !== "admin-users")
          .map((config) => {
            const Icon = iconMap[config.icon] || Command;
            return (
              <NavLink
                key={config.key}
                to={`/${config.key}`}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
                title={config.label}
              >
                <Icon size={19} />
                <span>{config.label}</span>
              </NavLink>
            );
          })}
        {user?.role === "super_admin" && (
          <div className="nav-section-label">
            {!collapsed && "ACCESS CONTROL"}
          </div>
        )}
        {user?.role === "super_admin" && (
          <NavLink
            to="/admin-users"
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
            title="Admin Users"
          >
            <ShieldCheck size={19} />
            <span>Admin Users</span>
          </NavLink>
        )}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar">
            {(user?.name || "A").slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <strong>{user?.name || "Administrator"}</strong>
              <span>
                {user?.role === "super_admin"
                  ? "Super administrator"
                  : "Department administrator"}
              </span>
            </div>
          )}
        </div>
        <button
          className="nav-link nav-logout"
          onClick={logout}
          title="Log out"
        >
          <LogOut size={19} />
          <span>Log out</span>
        </button>
        <button
          className="collapse-button"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <>
              <ChevronLeft size={17} />
              <span>Collapse menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      {sidebar}
      <div className={`main-shell ${collapsed ? "main-shell-expanded" : ""}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{title}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="environment-tag">
              <Activity size={14} /> Admin portal
            </span>
            <div className="topbar-divider" />
            <div className="topbar-user">
              <div className="avatar avatar-small">
                {(user?.name || "A").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <strong>{user?.name || "Administrator"}</strong>
                <span>
                  {user?.role === "super_admin"
                    ? "Super admin"
                    : "Department admin"}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Government Officer Directory</span>
          <span>Secure administration workspace</span>
        </footer>
      </div>
    </div>
  );
}
