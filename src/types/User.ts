export interface UserRequest {
    username: string;
    password: string;
    employeeId: number;
    roles: string[];
}

export interface UserResponse {
    id: number;
    username: string;
    enabled: boolean;
    roles: string[];
}
