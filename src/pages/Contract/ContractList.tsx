import { useEffect, useState } from "react";
import ContractForm from "./ContractForm";
import type { ContractRequest, ContractResponse } from "../../types/Contract";
import { createContract, searchContracts } from "../../api/contractApi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ContractList = () => {
    const [contracts, setContracts] = useState<ContractResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // ================= FILTER =================
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");
    const [contractType, setContractType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // ================= PAGINATION =================
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // ================= STATES =================
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchContracts = async () => {
        try {
            setLoading(true);

            const filters = {
                keyword: keyword || undefined,
                status: status || undefined,
                contractType: contractType || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            };

            const data = await searchContracts({
                ...filters,
                page: currentPage,
                size: pageSize,
                sort: "id,desc",
            });

            setContracts(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Fetch contracts failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // chỉ fetch khi đổi page hoặc size
    useEffect(() => {
        fetchContracts();
    }, [currentPage, pageSize]);

    // ================= CREATE =================
    const handleSubmit = async (data: ContractRequest) => {
        await createContract(data);
        setIsOpen(false);
        fetchContracts();
    };

    // ================= SEARCH =================
    const handleSearch = () => {
        setCurrentPage(0);
        fetchContracts();
    };

    const handleReset = () => {
        setKeyword("");
        setStatus("");
        setContractType("");
        setFromDate("");
        setToDate("");
        setPageSize(5);
        setCurrentPage(0);
    };

    // ================= EXPORT =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const filters = {
                keyword: keyword || undefined,
                status: status || undefined,
                contractType: contractType || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            };

            const res = await searchContracts({
                ...filters,
                page: 0,
                size: 9999,
                sort: "id,desc",
            });

            const fullData = res.content;

            if (fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const headers = [
                "Employee",
                "Type",
                "Start Date",
                "End Date",
                "Status",
            ];

            const data = fullData.map((c) => [
                c.employeeName,
                c.contractType,
                c.startDate,
                c.endDate || "-",
                c.status,
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

            worksheet["!cols"] = [
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const today = new Date().toISOString().split("T")[0];
            saveAs(blob, `contracts_${today}.xlsx`);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= UI HELPERS =================
    const getStatusColor = (status: string) => {
        if (status === "ACTIVE") return "bg-green-500";
        if (status === "EXPIRED") return "bg-red-500";
        if (status === "TERMINATED") return "bg-gray-500";
        return "bg-yellow-500";
    };

    const getTypeColor = (type: string) => {
        if (type === "FULL_TIME") return "bg-blue-500";
        if (type === "PART_TIME") return "bg-purple-500";
        return "bg-orange-500";
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Contract List</h1>
                <div className="flex space-x-2">
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
                        + Add
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
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="TERMINATED">TERMINATED</option>
                </select>

                <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">FULL_TIME</option>
                    <option value="PART_TIME">PART_TIME</option>
                    <option value="INTERNSHIP">INTERNSHIP</option>
                </select>

                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border px-3 py-2 rounded"
                />

                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
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

                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0);
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
                Showing {contracts.length} of {totalElements} records
            </div>

            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">Employee</th>
                        <th className="p-2 border text-center">Type</th>
                        <th className="p-2 border text-center">Start</th>
                        <th className="p-2 border text-center">End</th>
                        <th className="p-2 border text-center">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">
                                Loading...
                            </td>
                        </tr>
                    ) : contracts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">
                                No contracts found
                            </td>
                        </tr>
                    ) : (
                        contracts.map((c) => (
                            <tr key={c.id}>
                                <td className="p-2 border text-center">
                                    {c.employeeName}
                                </td>
                                <td className="p-2 border text-center">
                                    <span className={`text-white px-3 py-1 rounded text-sm ${getTypeColor(c.contractType)}`}>
                                        {c.contractType}
                                    </span>
                                </td>
                                <td className="p-2 border text-center">{c.startDate}</td>
                                <td className="p-2 border text-center">{c.endDate || "-"}</td>
                                <td className="p-2 border text-center">
                                    <span className={`text-white px-3 py-1 rounded text-sm ${getStatusColor(c.status)}`}>
                                        {c.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div className="flex justify-center items-center gap-2 mt-4">
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span>
                    Page {currentPage + 1} / {totalPages}
                </span>

                <button
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <ContractForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default ContractList;