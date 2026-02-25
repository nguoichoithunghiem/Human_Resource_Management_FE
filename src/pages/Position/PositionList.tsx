import { useEffect, useState } from "react";
import PositionForm from "./PositionForm";
import {
    createPosition,
    deletePosition,
    updatePosition,
    searchPositions
} from "../../api/positionApi";
import type { PositionRequest, PositionResponse } from "../../types/Position";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PositionList = () => {
    const [positions, setPositions] = useState<PositionResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<PositionResponse | null>(null);

    // 🔎 Search + Filter
    const [keyword, setKeyword] = useState("");
    const [minSalary, setMinSalary] = useState<number | undefined>();
    const [maxSalary, setMaxSalary] = useState<number | undefined>();

    // 📄 Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchPositions = async () => {
        setLoading(true);
        try {
            const data = await searchPositions({
                keyword,
                minSalary,
                maxSalary,
                page: currentPage,
                size: pageSize,
                sortBy: "id",
                sortDir: "asc"
            });

            setPositions(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Fetch positions failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Auto fetch when page / size / filter changes
    useEffect(() => {
        fetchPositions();
    }, [currentPage, pageSize, keyword, minSalary, maxSalary]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setCurrentPage(0);
    };

    const handleReset = () => {
        setKeyword("");
        setMinSalary(undefined);
        setMaxSalary(undefined);
        setPageSize(5);
        setCurrentPage(0);
    };

    // ================= EXPORT =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const res = await searchPositions({
                keyword,
                minSalary,
                maxSalary,
                page: 0,
                size: 9999,
                sortBy: "id",
                sortDir: "asc"
            });

            const fullData = res.content;

            if (fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const headers = ["Name", "Base Salary (VND)"];

            const data = fullData.map(p => [
                p.name,
                Number(p.baseSalary)
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

            worksheet["!cols"] = [
                { wch: 25 },
                { wch: 20 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Positions");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            saveAs(blob, "positions.xlsx");

        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= CRUD =================
    const handleSubmit = async (data: PositionRequest) => {
        if (editing) {
            await updatePosition(editing.id, data);
        } else {
            await createPosition(data);
        }

        setEditing(null);
        setIsOpen(false);
        fetchPositions();
    };

    const handleEdit = (position: PositionResponse) => {
        setEditing(position);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this position?"))
            return;

        await deletePosition(id);

        if (positions.length === 1 && currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        } else {
            fetchPositions();
        }
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Position List</h1>
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

            {/* SEARCH + FILTER */}
            <div className="flex gap-4 mb-4 flex-wrap items-center">
                <input
                    type="text"
                    placeholder="Search position..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border px-3 py-2 rounded w-64"
                />

                <input
                    type="number"
                    placeholder="Min Salary"
                    value={minSalary ?? ""}
                    onChange={(e) =>
                        setMinSalary(
                            e.target.value ? Number(e.target.value) : undefined
                        )
                    }
                    className="border px-3 py-2 rounded w-40"
                />

                <input
                    type="number"
                    placeholder="Max Salary"
                    value={maxSalary ?? ""}
                    onChange={(e) =>
                        setMaxSalary(
                            e.target.value ? Number(e.target.value) : undefined
                        )
                    }
                    className="border px-3 py-2 rounded w-40"
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

            {/* TOTAL RECORD */}
            <div className="mb-2 text-sm text-gray-600">
                Showing {positions.length} of {totalElements} records
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">Name</th>
                        <th className="p-2 border text-center">Base Salary</th>
                        <th className="p-2 border text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={3} className="text-center p-4">
                                Loading...
                            </td>
                        </tr>
                    ) : positions.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center p-4">
                                No data found
                            </td>
                        </tr>
                    ) : (
                        positions.map(p => (
                            <tr key={p.id}>
                                <td className="p-2 border text-center">
                                    {p.name}
                                </td>
                                <td className="p-2 border text-center">
                                    {Number(p.baseSalary).toLocaleString()} VND
                                </td>
                                <td className="p-2 border text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span>
                    Page {currentPage + 1} / {totalPages}
                </span>

                <button
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* MODAL */}
            <PositionForm
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setEditing(null);
                }}
                onSubmit={handleSubmit}
                editingPosition={editing}
            />
        </div>
    );
};

export default PositionList;