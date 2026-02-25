import React, { createContext, useContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";
import type { AnnouncementResponse } from "../types/Announcement";
import config from "../config.json";

interface WebSocketContextType {
    newCount: number;
    resetCount: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [newCount, setNewCount] = useState(0);

    useEffect(() => {
        // 🔥 Tách domain khỏi /api
        const baseUrl = config.BASE_URL.replace("/api", "");

        const socket = new SockJS(`${baseUrl}/ws`);

        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // auto reconnect sau 5s nếu mất kết nối

            onConnect: () => {
                console.log("✅ WebSocket connected");

                client.subscribe("/topic/announcements", (message) => {
                    const data: AnnouncementResponse = JSON.parse(message.body);

                    // 🔔 Hiển thị toast
                    toast.success(`📢 ${data.title}`);

                    // 🔔 Tăng badge
                    setNewCount(prev => prev + 1);
                });
            },

            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame.headers["message"]);
            }
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    const resetCount = () => setNewCount(0);

    return (
        <WebSocketContext.Provider value={{ newCount, resetCount }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error("useWebSocket must be used inside WebSocketProvider");
    }

    return context;
};