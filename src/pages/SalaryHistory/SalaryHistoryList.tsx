import { useEffect, useState } from "react";
import type {
    SalaryHistoryRequest,
    SalaryHistoryResponse,
} from "../../types/SalaryHistory";

import {
    createSalaryHistory,
    getSalaryHistories,
} from "../../api/salaryHistoryApi";

import SalaryHistoryForm from "./SalaryHistoryForm";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SalaryHistoryList = () => {
    const [histories, setHistories] = useState<SalaryHistoryResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);

    // Filter
    const [keyword, setKeyword] = useState("");
    const [employeeId, setEmployeeId] = useState<number | undefined>();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [exporting, setExporting] = useState(false);

    const fetchHistories = async () => {
        const data = await getSalaryHistories({
            page,
            size,
            keyword,
            employeeId,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
        });

        setHistories(data.content);
        setTotalPages(data.totalPages);
    };

    useEffect(() => {
        fetchHistories();
    }, [page, size]);

    const handleSearch = () => {
        setPage(0);
        fetchHistories();
    };

    const handleReset = () => {
        setKeyword("");
        setEmployeeId(undefined);
        setFromDate("");
        setToDate("");
        setPage(0);
        fetchHistories();
    };

    const handleSubmit = async (data: SalaryHistoryRequest) => {
        await createSalaryHistory(data);
        setIsOpen(false);
        fetchHistories();
    };

    const handleExport = async () => {
        try {
            setExporting(true);

            const res = await getSalaryHistories({
                page: 0,
                size: 9999,
                keyword,
                employeeId,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            const fullData = res.content;

            if (fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const now = new Date().toLocaleString("vi-VN");

            const title = [
                ["SALARY HISTORY REPORT"],
                [`Exported at: ${now}`],
                []
            ];

            const headers = [
                ["Employee", "Old Salary (VND)", "New Salary (VND)", "Changed Date"]
            ];

            const data = fullData.map(item => [
                item.employeeName,
                Number(item.oldSalary),
                Number(item.newSalary),
                new Date(item.changedDate).toLocaleDateString("vi-VN")
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([
                ...title,
                ...headers,
                ...data
            ]);

            worksheet["!cols"] = [
                { wch: 25 },
                { wch: 20 },
                { wch: 20 },
                { wch: 18 }
            ];

            // Format salary columns
            for (let i = 5; i <= fullData.length + 4; i++) {
                const oldSalaryCell = worksheet[`B${i}`];
                const newSalaryCell = worksheet[`C${i}`];

                if (oldSalaryCell) {
                    oldSalaryCell.t = "n";
                    oldSalaryCell.z = "#,##0";
                }

                if (newSalaryCell) {
                    newSalaryCell.t = "n";
                    newSalaryCell.z = "#,##0";
                }
            }

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "SalaryHistory");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            saveAs(blob, "salary_history.xlsx");

        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    const formatSalary = (salary: number) =>
        new Intl.NumberFormat("vi-VN").format(salary) + " VND";

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("vi-VN");

    return (
        <div className="p-6">

            {/* Header */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Salary History</h1>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50"
                    >
                        {exporting ? "Exporting..." : "Export Excel"}
                    </button>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-gray-100 p-4 rounded mb-4 grid grid-cols-6 gap-4">
                <input
                    type="text"
                    placeholder="Search employee..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    type="number"
                    placeholder="Employee ID"
                    value={employeeId ?? ""}
                    onChange={(e) =>
                        setEmployeeId(
                            e.target.value ? Number(e.target.value) : undefined
                        )
                    }
                    className="border p-2 rounded"
                />

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



                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
                    >
                        Search
                    </button>

                    <button
                        onClick={handleReset}
                        className="bg-gray-500 text-white px-4 rounded hover:bg-gray-600"
                    >
                        Reset
                    </button>
                    <select
                        value={size}
                        onChange={(e) => {
                            setSize(Number(e.target.value));
                            setPage(0);
                        }}
                        className="border p-2 rounded"
                    >
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">Employee</th>
                        <th className="p-2 border text-center">Old Salary</th>
                        <th className="p-2 border text-center">New Salary</th>
                        <th className="p-2 border text-center">Changed Date</th>
                    </tr>
                </thead>

                <tbody>
                    {histories.length > 0 ? (
                        histories.map((item) => (
                            <tr key={item.id}>
                                <td className="p-2 border text-center font-semibold">
                                    {item.employeeName}
                                </td>
                                <td className="p-2 border text-center">
                                    {formatSalary(item.oldSalary)}
                                </td>
                                <td className="p-2 border text-center text-green-600 font-semibold">
                                    {formatSalary(item.newSalary)}
                                </td>
                                <td className="p-2 border text-center">
                                    {formatDate(item.changedDate)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center p-4 text-gray-500">
                                No data found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 gap-2">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span>
                    Page {page + 1} / {totalPages}
                </span>

                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <SalaryHistoryForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default SalaryHistoryList;