import { useEffect, useState } from "react";
import type {
    AnnouncementRequest,
    AnnouncementResponse,
} from "../../types/Announcement";

import {
    createAnnouncement,
    getAnnouncements,
} from "../../api/announcementApi";

import AnnouncementForm from "./AnnouncementForm";

const AnnouncementList = () => {

    const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchAnnouncements = async () => {
        const data = await getAnnouncements();
        setAnnouncements(data);
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (data: AnnouncementRequest) => {
        await createAnnouncement(data);
        setIsOpen(false);
        fetchAnnouncements();
    };

    return (
        <div className="p-6">

            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    Announcements
                </h1>

                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    + Add
                </button>
            </div>

            <div className="grid gap-4">
                {announcements.map(item => (
                    <div
                        key={item.id}
                        className="border p-4 rounded shadow-sm bg-white"
                    >
                        <h2 className="font-bold text-lg">
                            {item.title}
                        </h2>

                        <p className="text-gray-700 mt-2">
                            {item.content}
                        </p>

                        <p className="text-sm text-gray-500 mt-3">
                            Posted by: {item.createdByName}
                        </p>
                    </div>
                ))}
            </div>

            <AnnouncementForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default AnnouncementList;
