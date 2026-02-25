import api from "./axiosConfig";
import type { LeaveRequest, LeaveResponse } from "../types/Leave";
import type { PageResponse } from "../types/Page";

export interface LeaveFilter {
    page?: number;
    size?: number;
    employeeId?: number;
    status?: string;
    keyword?: string;
}

export const getLeaves = async (filters: LeaveFilter) => {
    const res = await api.get<PageResponse<LeaveResponse>>(
        "/leaves",
        {
            params: filters
        }
    );

    return res.data;
};

export const createLeave = async (data: LeaveRequest) => {
    const res = await api.post<LeaveResponse>("/leaves", data);
    return res.data;
};
