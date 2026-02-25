import { useEffect, useState } from "react";
import PayrollForm from "./PayrollForm";
import type { PayrollRequest, PayrollResponse } from "../../types/Payroll";
import { calculatePayroll, searchPayrolls } from "../../api/payrollApi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DEFAULT_PAGE_SIZE = 5;

const PayrollList = () => {
    // ================= STATE =================
    const [payrolls, setPayrolls] = useState<PayrollResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Filters
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");
    const [month, setMonth] = useState<number | undefined>();
    const [year, setYear] = useState<number | undefined>();
    const [minNetSalary, setMinNetSalary] = useState<number | undefined>();
    const [maxNetSalary, setMaxNetSalary] = useState<number | undefined>();

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(0);

    // UI state
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchPayrolls = async (
        pageNumber = page,
        size = pageSize
    ) => {
        try {
            setLoading(true);

            const response = await searchPayrolls({
                keyword: keyword || undefined,
                status: status || undefined,
                month,
                year,
                minNetSalary,
                maxNetSalary,
                page: pageNumber,
                size: size,
                sortBy: "id",
                sortDir: "desc",
            });

            setPayrolls(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Fetch payroll failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls(page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setPage(0);
    };

    const handleReset = () => {
        setKeyword("");
        setStatus("");
        setMonth(undefined);
        setYear(undefined);
        setMinNetSalary(undefined);
        setMaxNetSalary(undefined);
        setPage(0);
    };

    // ================= EXPORT =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const response = await searchPayrolls({
                keyword: keyword || undefined,
                status: status || undefined,
                month,
                year,
                minNetSalary,
                maxNetSalary,
                page: 0,
                size: 9999,
                sortBy: "id",
                sortDir: "desc",
            });

            const fullData = response.content;

            if (!fullData.length) {
                alert("No data to export!");
                return;
            }

            const headers = [
                "Employee",
                "Month",
                "Base Salary",
                "Bonus",
                "Deduction",
                "Net Salary",
                "Status"
            ];

            const rows = fullData.map(p => [
                p.employeeName,
                `${p.month}/${p.year}`,
                p.baseSalary,
                p.bonus,
                p.deduction,
                p.netSalary,
                p.status
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

            worksheet["!cols"] = [
                { wch: 25 },
                { wch: 12 },
                { wch: 18 },
                { wch: 15 },
                { wch: 15 },
                { wch: 18 },
                { wch: 15 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Payrolls");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            saveAs(blob, `payroll_${new Date().toISOString()}.xlsx`);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= CALCULATE =================
    const handleSubmit = async (data: PayrollRequest) => {
        await calculatePayroll(data);
        setIsOpen(false);

        if (page !== 0) {
            setPage(0);
        } else {
            fetchPayrolls(0);
        }
    };

    // ================= HELPERS =================
    const getStatusColor = (status: string) => {
        if (status === "PAID") return "bg-green-500";
        if (status === "CANCELLED") return "bg-red-500";
        return "bg-yellow-500";
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // ================= RENDER =================
    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    Payroll Management
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
                        + Calculate
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
                    className="border px-3 py-2 rounded"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>

                <input
                    type="number"
                    placeholder="Month"
                    value={month ?? ""}
                    onChange={(e) =>
                        setMonth(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="border px-3 py-2 rounded w-24"
                />

                <input
                    type="number"
                    placeholder="Year"
                    value={year ?? ""}
                    onChange={(e) =>
                        setYear(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="border px-3 py-2 rounded w-28"
                />

                <input
                    type="number"
                    placeholder="Min Net"
                    value={minNetSalary ?? ""}
                    onChange={(e) =>
                        setMinNetSalary(
                            e.target.value ? Number(e.target.value) : undefined
                        )
                    }
                    className="border px-3 py-2 rounded"
                />

                <input
                    type="number"
                    placeholder="Max Net"
                    value={maxNetSalary ?? ""}
                    onChange={(e) =>
                        setMaxNetSalary(
                            e.target.value ? Number(e.target.value) : undefined
                        )
                    }
                    className="border px-3 py-2 rounded"
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
                    className="border px-3 py-2 rounded"
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
                        <th className="p-2 border text-center">Month</th>
                        <th className="p-2 border text-center">Base</th>
                        <th className="p-2 border text-center">Bonus</th>
                        <th className="p-2 border text-center">Deduction</th>
                        <th className="p-2 border text-center">Net</th>
                        <th className="p-2 border text-center">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="text-center p-4">
                                Loading...
                            </td>
                        </tr>
                    ) : payrolls.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center p-4">
                                No payroll data found
                            </td>
                        </tr>
                    ) : (
                        payrolls.map((p) => (
                            <tr key={p.id}>
                                <td className="p-2 border text-center">
                                    {p.employeeName}
                                </td>
                                <td className="p-2 border text-center">
                                    {p.month}/{p.year}
                                </td>
                                <td className="p-2 border text-center">
                                    {formatCurrency(p.baseSalary)}
                                </td>
                                <td className="p-2 border text-center">
                                    {formatCurrency(p.bonus)}
                                </td>
                                <td className="p-2 border text-center">
                                    {formatCurrency(p.deduction)}
                                </td>
                                <td className="p-2 border text-center font-semibold">
                                    {formatCurrency(p.netSalary)}
                                </td>
                                <td className="p-2 border text-center">
                                    <span
                                        className={`text-white px-3 py-1 rounded text-sm ${getStatusColor(
                                            p.status
                                        )}`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-2 mt-4">
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

            <PayrollForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default PayrollList;