export interface AnnouncementRequest {
    title: string;
    content: string;
    createdBy: number;
}

export interface AnnouncementResponse {
    id: number;
    title: string;
    content: string;
    createdByName: string;
}
