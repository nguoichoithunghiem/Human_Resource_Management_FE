import api from "./axiosConfig";
import type { PositionRequest, PositionResponse } from "../types/Position";
import type { PageResponse } from "../types/Page";

export interface PositionSearchParams {
    keyword?: string;
    minSalary?: number;
    maxSalary?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

// 🔎 Search + Pagination + Filter
export const searchPositions = async (
    params: PositionSearchParams
) => {
    const res = await api.get<PageResponse<PositionResponse>>(
        "/positions/search",
        { params }
    );
    return res.data;
};

// 📄 Get all (nếu vẫn muốn dùng)
export const getPositions = async () => {
    const res = await api.get<PositionResponse[]>("/positions");
    return res.data;
};

// ➕ Create
export const createPosition = async (data: PositionRequest) => {
    const res = await api.post<PositionResponse>("/positions", data);
    return res.data;
};

// ✏️ Update
export const updatePosition = async (id: number, data: PositionRequest) => {
    const res = await api.put<PositionResponse>(`/positions/${id}`, data);
    return res.data;
};

// ❌ Delete
export const deletePosition = async (id: number) => {
    await api.delete(`/positions/${id}`);
};
