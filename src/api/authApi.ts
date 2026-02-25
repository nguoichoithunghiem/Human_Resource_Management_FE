import api from "./axiosConfig";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    roles: string[];
}

export const loginApi = async (
    data: LoginRequest
): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
};