import api from "./axiosConfig";
import type { RoleResponse } from "../types/Role";
import type { PageResponse } from "../types/Page";

export const getRoles = async (params: {
    keyword?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}) => {
    const res = await api.get<PageResponse<RoleResponse>>(
        "/roles/search",
        { params }
    );
    return res.data;
};


export const createRole = async (name: string) => {
    const res = await api.post<RoleResponse>(
        `/roles?name=${encodeURIComponent(name)}`
    );
    return res.data;
};

export const updateRole = async (id: number, name: string) => {
    const res = await api.put<RoleResponse>(
        `/roles/${id}?name=${encodeURIComponent(name)}`
    );
    return res.data;
};

export const deleteRole = async (id: number) => {
    await api.delete(`/roles/${id}`);
};
