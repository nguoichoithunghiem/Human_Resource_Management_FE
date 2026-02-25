import api from "./axiosConfig";
import type {
    DepartmentRequest,
    DepartmentResponse,
} from "../types/Department";
import type { PageResponse } from "../types/Page";

export interface DepartmentSearchParams {
    keyword?: string;
    minEmployees?: number;
    maxEmployees?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

export const searchDepartments = async (
    params: DepartmentSearchParams
) => {
    const res = await api.get<PageResponse<DepartmentResponse>>(
        "/departments/search",
        { params }
    );
    return res.data;
};

export const getDepartments = async () => {
    const res = await api.get<DepartmentResponse[]>("/departments");
    return res.data;
};

export const createDepartment = async (data: DepartmentRequest) => {
    const res = await api.post<DepartmentResponse>("/departments", data);
    return res.data;
};


export const updateDepartment = async (
    id: number,
    data: DepartmentRequest
) => {
    const res = await api.put<DepartmentResponse>(
        `/departments/${id}`,
        data
    );
    return res.data;
};

export const deleteDepartment = async (id: number) => {
    await api.delete(`/departments/${id}`);
};
