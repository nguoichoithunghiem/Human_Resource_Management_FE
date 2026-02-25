
import api from "./axiosConfig";
import type { EmployeeRequest, EmployeeResponse } from "../types/Employee";
import type { PageResponse } from "../types/Page";

export interface EmployeeSearchParams {
    keyword?: string;
    status?: string;
    departmentId?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

// 🔍 Search + Pagination + Filter
export const searchEmployees = async (
    params: EmployeeSearchParams
) => {
    const res = await api.get<PageResponse<EmployeeResponse>>(
        "/employees/search",
        { params }
    );
    return res.data;
};

// ➕ Create
export const createEmployee = async (data: EmployeeRequest) => {
    const res = await api.post<EmployeeResponse>("/employees", data);
    return res.data;
};

// ✏️ Update
export const updateEmployee = async (id: number, data: EmployeeRequest) => {
    const res = await api.put<EmployeeResponse>(`/employees/${id}`, data);
    return res.data;
};

// ❌ Delete
export const deleteEmployee = async (id: number) => {
    await api.delete(`/employees/${id}`);
};
export const getEmployees = async () => {
    const res = await api.get<EmployeeResponse[]>("/employees");
    return res.data;
};
