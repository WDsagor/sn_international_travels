import React from "react";
import { LayoutDashboard, Ticket, Users, Settings, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Dock } from "lucide-react";
import { logout } from "../../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tickets", label: "Tickets", icon: Ticket },
    { path: "/passports&visa", label: "Passport & Visa", icon: Dock },
    { path: "/clients", label: "Clients & Ledger", icon: Users },
    { path: "/users", label: "Staff Portal", icon: Settings },
  ];
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-30 lg:hidden cursor-pointer"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 transform lg:transform-none flex flex-col justify-between h-[calc(100vh-64px)] 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xx xl:text-xs font-medium transition-all group cursor-pointer
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* --- LOGOUT BUTTON --- */}
        <div className="p-4 border-t border-gray-100">
          <button
            className="w-full flex items-center text-xx xl:text-xs gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors group cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
