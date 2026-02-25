import api from "./axiosConfig";
import type {
    SalaryHistoryRequest,
    SalaryHistoryResponse,
} from "../types/SalaryHistory";
import type { PageResponse } from "../types/Page";

export const getSalaryHistories = async (
    params: {
        page?: number;
        size?: number;
        employeeId?: number;
        fromDate?: string;
        toDate?: string;
        keyword?: string;
    }
) => {
    const res = await api.get<PageResponse<SalaryHistoryResponse>>(
        "/salary-history",
        { params }
    );
    return res.data;
};


export const createSalaryHistory = async (
    data: SalaryHistoryRequest
) => {
    const res = await api.post<SalaryHistoryResponse>(
        "/salary-history",
        data
    );
    return res.data;
};

export const getSalaryByEmployee = async (employeeId: number) => {
    const res = await api.get<SalaryHistoryResponse[]>(
        `/salary-history/employee/${employeeId}`
    );
    return res.data;
};

