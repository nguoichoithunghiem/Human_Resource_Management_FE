import api from "./axiosConfig";
import type { ContractRequest, ContractResponse } from "../types/Contract";
import type { PageResponse } from "../types/Page";

export interface ContractSearchParams {
    employeeId?: number;
    status?: string;
    contractType?: string;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string; // ví dụ: "id,desc"
}

// 🔎 SEARCH + FILTER + PAGINATION
export const searchContracts = async (
    params: ContractSearchParams
) => {
    const res = await api.get<PageResponse<ContractResponse>>(
        "/contracts",
        { params }
    );
    return res.data;
};

// ➕ CREATE
export const createContract = async (data: ContractRequest) => {
    const res = await api.post<ContractResponse>("/contracts", data);
    return res.data;
};
