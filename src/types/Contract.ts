export interface ContractRequest {
    employeeId: number;
    contractType: string;
    startDate: string;
    endDate: string;
    salary: number;
}

export interface ContractResponse {
    id: number;
    employeeName: string;
    contractType: string;
    startDate: string;
    endDate: string;
    status: string;
}
