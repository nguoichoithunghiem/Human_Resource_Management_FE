import { useEffect, useState } from "react";
import type { AttendanceResponse, AttendanceRequest } from "../../types/Attendance";
import { getAttendances, checkIn, checkOut } from "../../api/attendanceApi";
import AttendanceForm from "./AttendanceForm";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AttendanceList = () => {
    const [attendances, setAttendances] = useState<AttendanceResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // ================= FILTER =================
    const [status, setStatus] = useState("");
    const [keyword, setKeyword] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // ================= PAGINATION =================
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // ================= STATES =================
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchAttendances = async () => {
        try {
            setLoading(true);

            const filters = {
                status: status || undefined,
                keyword: keyword || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            };

            const data = await getAttendances({
                ...filters,
                page,
                size: pageSize,
            });

            setAttendances(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Fetch attendance failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // chỉ fetch khi đổi page hoặc size
    useEffect(() => {
        fetchAttendances();
    }, [page, pageSize]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setPage(0);
        fetchAttendances();
    };

    const handleReset = () => {
        setStatus("");
        setKeyword("");
        setFromDate("");
        setToDate("");
        setPageSize(5);
        setPage(0);
    };

    // ================= EXPORT =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const filters = {
                status: status || undefined,
                keyword: keyword || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            };

            const res = await getAttendances({
                ...filters,
                page: 0,
                size: 9999,
            });

            const fullData = res.content;

            if (fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const headers = [
                "Employee",
                "Check In",
                "Check Out",
                "Status",
            ];

            const data = fullData.map(a => [
                a.employeeName,
                a.checkIn,
                a.checkOut || "-",
                a.status,
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

            worksheet["!cols"] = [
                { wch: 25 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendances");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const today = new Date().toISOString().split("T")[0];
            saveAs(blob, `attendance_${today}.xlsx`);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= ACTIONS =================
    const handleCheckOut = async (id: number) => {
        if (!window.confirm("Confirm check out?")) return;
        await checkOut(id);
        fetchAttendances();
    };

    const handleSubmit = async (data: AttendanceRequest) => {
        await checkIn(data);
        setIsOpen(false);
        fetchAttendances();
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Attendance List</h1>

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
                        + Check In
                    </button>
                </div>
            </div>

            {/* FILTER */}
            <div className="flex flex-wrap gap-3 mb-4">
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
                    <option value="PRESENT">PRESENT</option>
                    <option value="LATE">LATE</option>
                </select>

                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
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
                        setPageSize(Number(e.target.value));
                        setPage(0);
                    }}
                    className="border px-3 py-2 rounded"
                >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                </select>
            </div>

            <div className="mb-2 text-sm text-gray-600">
                Showing {attendances.length} of {totalElements} records
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">Employee</th>
                        <th className="p-2 border text-center">Check In</th>
                        <th className="p-2 border text-center">Check Out</th>
                        <th className="p-2 border text-center">Status</th>
                        <th className="p-2 border text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">
                                Loading...
                            </td>
                        </tr>
                    ) : attendances.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">
                                No attendance found
                            </td>
                        </tr>
                    ) : (
                        attendances.map(a => (
                            <tr key={a.id}>
                                <td className="p-2 border text-center">{a.employeeName}</td>
                                <td className="p-2 border text-center">{a.checkIn}</td>
                                <td className="p-2 border text-center">{a.checkOut || "-"}</td>

                                <td className="p-2 border text-center">
                                    <span
                                        className={`px-2 py-1 rounded text-white ${a.status === "LATE"
                                            ? "bg-red-500"
                                            : "bg-green-600"
                                            }`}
                                    >
                                        {a.status}
                                    </span>
                                </td>

                                <td className="p-2 border text-center">
                                    {a.checkOut ? (
                                        <span className="text-gray-400">
                                            Completed
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleCheckOut(a.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded"
                                        >
                                            Check Out
                                        </button>
                                    )}
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

                <span className="px-3 py-1">
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

            <AttendanceForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default AttendanceList;