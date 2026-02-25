export interface AttendanceRequest {
    employeeId: number;
}

export interface AttendanceResponse {
    id: number;
    employeeName: string;
    checkIn: string;
    checkOut: string | null;
    status: string;
}
