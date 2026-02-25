import api from "./axiosConfig";
import type { AttendanceRequest, AttendanceResponse } from "../types/Attendance";
import type { PageResponse } from "../types/Page";

export interface AttendanceFilter {
    page?: number;
    size?: number;
    employeeId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
}

export const getAttendances = async (
    filters: AttendanceFilter
) => {

    const res = await api.get<PageResponse<AttendanceResponse>>(
        "/attendance",
        {
            params: filters
        }
    );

    return res.data;
};

export const checkIn = async (data: AttendanceRequest) => {
    const res = await api.post<AttendanceResponse>(
        "/attendance/check-in",
        data
    );
    return res.data;
};

export const checkOut = async (attendanceId: number) => {
    const res = await api.put<AttendanceResponse>(
        `/attendance/check-out/${attendanceId}`
    );
    return res.data;
};


