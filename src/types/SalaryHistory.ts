export interface SalaryHistoryRequest {
    employeeId: number;
    oldSalary: number;
    newSalary: number;
}

export interface SalaryHistoryResponse {
    id: number;
    employeeName: string;
    oldSalary: number;
    newSalary: number;
    changedDate: string;
}
