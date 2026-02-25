export interface LeaveRequest {
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
}

export interface LeaveResponse {
    id: number;
    employeeName: string;
    startDate: string;
    endDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reason: string;
}
