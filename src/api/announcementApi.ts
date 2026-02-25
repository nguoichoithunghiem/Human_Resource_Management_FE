import api from "./axiosConfig";
import type {
    AnnouncementRequest,
    AnnouncementResponse,
} from "../types/Announcement";

export const getAnnouncements = async () => {
    const res = await api.get<AnnouncementResponse[]>("/announcements");
    return res.data;
};

export const createAnnouncement = async (
    data: AnnouncementRequest
) => {
    const res = await api.post<AnnouncementResponse>(
        "/announcements",
        data
    );
    return res.data;
};
