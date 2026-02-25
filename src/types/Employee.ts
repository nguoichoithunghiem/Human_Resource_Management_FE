export interface EmployeeResponse {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    hireDate: string;
    status: string;
    departmentName: string;
    positionName: string;
}

export interface EmployeeRequest {
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    hireDate: string;
    status: string;
    departmentId: number;
    positionId: number;
}
