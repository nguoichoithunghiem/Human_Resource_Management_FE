export interface PayrollRequest {
    employeeId: number;
    month: number;
    year: number;
    bonus?: number;
    deduction?: number;
}

export interface PayrollResponse {
    id: number;
    employeeName: string;
    month: number;
    year: number;
    baseSalary: number;
    bonus: number;
    deduction: number;
    netSalary: number;
    status: "PENDING" | "PAID";
}
