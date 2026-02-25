import { useEffect, useState } from "react";
import LeaveForm from "./LeaveForm";
import type { LeaveRequest, LeaveResponse } from "../../types/Leave";
import { createLeave, getLeaves } from "../../api/leaveApi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DEFAULT_PAGE_SIZE = 5;

const LeaveList = () => {
    // ================= STATE =================
    const [leaves, setLeaves] = useState<LeaveResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Filters
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");
    const [employeeId, setEmployeeId] = useState("");

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(0);

    // UI state
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchLeaves = async (
        pageNumber = page,
        size = pageSize
    ) => {
        try {
            setLoading(true);

            const response = await getLeaves({
                page: pageNumber,
                size: size,
                keyword: keyword || undefined,
                status: status || undefined,
                employeeId: employeeId
                    ? Number(employeeId)
                    : undefined,
            });

            setLeaves(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Fetch leaves failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves(page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setPage(0);
    };

    const handleReset = () => {
        setKeyword("");
        setStatus("");
        setEmployeeId("");
        setPage(0);
    };

    // ================= EXPORT =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const response = await getLeaves({
                page: 0,
                size: 9999,
                keyword: keyword || undefined,
                status: status || undefined,
                employeeId: employeeId
                    ? Number(employeeId)
                    : undefined,
            });

            const fullData = response.content;

            if (!fullData.length) {
                alert("No data to export!");
                return;
            }

            const headers = [
                "Employee",
                "Start Date",
                "End Date",
                "Reason",
                "Status",
            ];

            const rows = fullData.map((item) => [
                item.employeeName,
                item.startDate,
                item.endDate,
                item.reason,
                item.status,
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

            worksheet["!cols"] = [
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 30 },
                { wch: 15 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "LeaveRequests"
            );

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, "leave_requests.xlsx");
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= CREATE =================
    const handleSubmit = async (data: LeaveRequest) => {
        await createLeave(data);
        setIsOpen(false);

        if (page !== 0) {
            setPage(0);
        } else {
            fetchLeaves(0);
        }
    };

    // ================= HELPERS =================
    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-green-500";
            case "REJECTED":
                return "bg-red-500";
            default:
                return "bg-yellow-500";
        }
    };

    // ================= RENDER =================
    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    Leave Requests
                </h1>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {exporting ? "Exporting..." : "Export Excel"}
                    </button>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        + Request
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search employee..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border p-2 rounded"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                </select>

                <input
                    type="number"
                    placeholder="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="border p-2 rounded"
                />



                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Search
                </button>

                <button
                    onClick={handleReset}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Reset
                </button>
                {/* PAGE SIZE */}
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPage(0);
                        setPageSize(Number(e.target.value));
                    }}
                    className="border p-2 rounded"
                >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                </select>
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">Employee</th>
                        <th className="p-2 border text-center">Start</th>
                        <th className="p-2 border text-center">End</th>
                        <th className="p-2 border text-center">Reason</th>
                        <th className="p-2 border text-center">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4">
                                Loading...
                            </td>
                        </tr>
                    ) : leaves.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4">
                                No data found
                            </td>
                        </tr>
                    ) : (
                        leaves.map((leave) => (
                            <tr key={leave.id}>
                                <td className="p-2 border text-center">
                                    {leave.employeeName}
                                </td>
                                <td className="p-2 border text-center">
                                    {leave.startDate}
                                </td>
                                <td className="p-2 border text-center">
                                    {leave.endDate}
                                </td>
                                <td className="p-2 border text-center">
                                    {leave.reason}
                                </td>
                                <td className="p-2 border text-center">
                                    <span
                                        className={`text-white px-3 py-1 rounded text-sm ${getStatusColor(
                                            leave.status
                                        )}`}
                                    >
                                        {leave.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-center mt-4 gap-2">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(prev => prev - 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span>
                    Page {page + 1} / {totalPages}
                </span>

                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <LeaveForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default LeaveList;