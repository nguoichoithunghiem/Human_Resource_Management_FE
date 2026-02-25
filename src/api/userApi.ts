import api from "./axiosConfig";
import type { UserRequest, UserResponse } from "../types/User";
import type { PageResponse } from "../types/Page";

export interface UserFilter {
    page?: number;
    size?: number;
    enabled?: boolean;
    role?: string;
    employeeId?: number;
    keyword?: string;
}

export const getUsers = async (filters: UserFilter) => {
    const res = await api.get<PageResponse<UserResponse>>(
        "/users",
        {
            params: filters
        }
    );

    return res.data;
};

export const createUser = async (data: UserRequest) => {
    const res = await api.post<UserResponse>("/users", data);
    return res.data;
};

export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`);
};
