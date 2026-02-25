import api from "./axiosConfig";
import type { PayrollRequest, PayrollResponse } from "../types/Payroll";
import type { PageResponse } from "../types/Page";

export interface PayrollSearchParams {
    keyword?: string;
    status?: string;
    month?: number;
    year?: number;
    employeeId?: number;
    minNetSalary?: number;
    maxNetSalary?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

// 🔎 SEARCH + FILTER + PAGINATION
export const searchPayrolls = async (
    params: PayrollSearchParams
) => {
    const res = await api.get<PageResponse<PayrollResponse>>(
        "/payroll/search",
        { params }
    );
    return res.data;
};

// 📄 Get all (nếu vẫn cần)
export const getPayrolls = async () => {
    const res = await api.get<PayrollResponse[]>("/payroll");
    return res.data;
};

// ➕ Calculate payroll
export const calculatePayroll = async (data: PayrollRequest) => {
    const res = await api.post<PayrollResponse>("/payroll", data);
    return res.data;
};
