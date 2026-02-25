import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

type Props = {
    children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
    return (
        <div className="h-screen flex flex-col">
            <Header />

            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 bg-gray-100 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
