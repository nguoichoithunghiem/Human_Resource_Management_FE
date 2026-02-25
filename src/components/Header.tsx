import { Bell } from "lucide-react";
import { useWebSocket } from "../context/WebSocketContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const { newCount, resetCount } = useWebSocket();
    const navigate = useNavigate();

    const handleClick = () => {
        resetCount();
        navigate("/announcements");
    };

    return (
        <header className="h-16 bg-blue-600 text-white flex items-center justify-between px-6 shadow-md">
            <h1 className="text-xl font-bold">My Admin</h1>

            <div className="flex items-center gap-4">
                <div className="relative cursor-pointer" onClick={handleClick}>
                    <Bell size={22} />

                    {newCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                            {newCount}
                        </span>
                    )}
                </div>
                <span className="font-medium">Xin chào, User</span>
                <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                    U
                </div>
            </div>
        </header>
    );
};

export default Header;