import {
    Users,
    Briefcase,
    LogOut,
    Building2,
    Contact,
    User,
    CheckCircle,
    Outdent,
    DollarSignIcon,
    History,
    Bell,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

interface MenuItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    roles: string[];
}

const Sidebar = () => {
    const navigate = useNavigate();

    // ===== LẤY ROLE =====
    const roles: string[] = JSON.parse(
        localStorage.getItem("roles") || "[]"
    );

    const hasAccess = (allowedRoles: string[]) =>
        allowedRoles.some((role) => roles.includes(role));

    // ===== MENU CONFIG =====
    const menuItems: MenuItem[] = [
        {
            path: "/",
            label: "Employees",
            icon: <Users size={20} />,
            roles: ["ADMIN"],
        },
        {
            path: "/positions",
            label: "Positions",
            icon: <Briefcase size={20} />,
            roles: ["ADMIN", "MANAGER"],
        },
        {
            path: "/departments",
            label: "Departments",
            icon: <Building2 size={20} />,
            roles: ["ADMIN", "MANAGER"],
        },
        {
            path: "/contracts",
            label: "Contracts",
            icon: <Contact size={20} />,
            roles: ["ADMIN", "MANAGER"],
        },
        {
            path: "/attendances",
            label: "Attendances",
            icon: <CheckCircle size={20} />,
            roles: ["ADMIN", "MANAGER", "USER"],
        },
        {
            path: "/leaves",
            label: "Leaves",
            icon: <Outdent size={20} />,
            roles: ["ADMIN", "MANAGER", "USER"],
        },
        {
            path: "/payrolls",
            label: "Payrolls",
            icon: <DollarSignIcon size={20} />,
            roles: ["ADMIN", "MANAGER", "USER"],
        },
        {
            path: "/salaryHistories",
            label: "Salary Histories",
            icon: <History size={20} />,
            roles: ["ADMIN", "MANAGER", "USER"],
        },
        {
            path: "/users",
            label: "Users",
            icon: <User size={20} />,
            roles: ["ADMIN"],
        },
        {
            path: "/roles",
            label: "Roles",
            icon: <Users size={20} />,
            roles: ["ADMIN"],
        },
        {
            path: "/announcements",
            label: "Announcements",
            icon: <Bell size={20} />,
            roles: ["ADMIN", "MANAGER", "USER"],
        },
    ];

    // ===== LOGOUT =====
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("roles");
        localStorage.removeItem("username");
        navigate("/login");
    };

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 p-3 rounded transition 
        ${isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-700 text-gray-300"
        }`;

    return (
        <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col justify-between">
            <div>
                <h1 className="text-xl font-bold mb-8 text-white">
                    HRM System
                </h1>

                <nav className="flex flex-col gap-2">
                    {menuItems
                        .filter((item) => hasAccess(item.roles))
                        .map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={linkClass}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                </nav>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded text-red-400 hover:bg-gray-700 transition"
            >
                <LogOut size={20} />
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;