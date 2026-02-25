import { useEffect, useState } from "react";
import DepartmentForm from "./DepartmentForm";
import type {
    DepartmentRequest,
    DepartmentResponse,
} from "../../types/Department";
import {
    createDepartment,
    deleteDepartment,
    updateDepartment,
    searchDepartments,
} from "../../api/departmentApi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DepartmentList = () => {
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] =
        useState<DepartmentResponse | null>(null);

    // ================= SEARCH + FILTER =================
    const [keyword, setKeyword] = useState("");
    const [minEmployees, setMinEmployees] =
        useState<number | undefined>();
    const [maxEmployees, setMaxEmployees] =
        useState<number | undefined>();

    // ================= PAGINATION =================
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await searchDepartments({
                keyword,
                minEmployees,
                maxEmployees,
                page: currentPage,
                size: pageSize,
                sortBy: "id",
                sortDir: "asc",
            });

            setDepartments(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Fetch departments failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [currentPage, pageSize]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setCurrentPage(0);
        fetchDepartments();
    };

    const handleReset = () => {
        setKeyword("");
        setMinEmployees(undefined);
        setMaxEmployees(undefined);
        setPageSize(5);
        setCurrentPage(0);
    };

    // ================= EXPORT (Full Data by Filter) =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const res = await searchDepartments({
                keyword,
                minEmployees,
                maxEmployees,
                page: 0,
                size: 9999,
                sortBy: "id",
                sortDir: "asc",
            });

            const fullData = res.content;

            if (fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const headers = ["Name", "Description"];

            const data = fullData.map((d) => [
                d.name,
                d.description,
            ]);

            const worksheet =
                XLSX.utils.aoa_to_sheet([headers, ...data]);

            worksheet["!cols"] = [
                { wch: 30 },
                { wch: 50 },
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Departments"
            );

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, "departments.xlsx");
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= CRUD =================
    const handleSubmit = async (data: DepartmentRequest) => {
        if (editing) {
            await updateDepartment(editing.id, data);
        } else {
            await createDepartment(data);
        }

        setEditing(null);
        setIsOpen(false);
        fetchDepartments();
    };

    const handleEdit = (department: DepartmentResponse) => {
        setEditing(department);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this department?"))
            return;

        await deleteDepartment(id);

        if (departments.length === 1 && currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        } else {
            fetchDepartments();
        }
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    Department List
                </h1>

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
                    placeholder="Search by name/description..."
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }
                    className="border px-3 py-2 rounded"
                />

                <input
                    type="number"
                    placeholder="Min Employees"
                    value={minEmployees ?? ""}
                    onChange={(e) =>
                        setMinEmployees(
                            e.target.value
                                ? Number(e.target.value)
                                : undefined
                        )
                    }
                    className="border px-3 py-2 rounded"
                />

                <input
                    type="number"
                    placeholder="Max Employees"
                    value={maxEmployees ?? ""}
                    onChange={(e) =>
                        setMaxEmployees(
                            e.target.value
                                ? Number(e.target.value)
                                : undefined
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

                {/* Page Size */}
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
                Showing {departments.length} of {totalElements} records
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">
                            Name
                        </th>
                        <th className="p-2 border text-center">
                            Description
                        </th>
                        <th className="p-2 border text-center">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={3}
                                className="text-center p-4"
                            >
                                Loading...
                            </td>
                        </tr>
                    ) : departments.length === 0 ? (
                        <tr>
                            <td
                                colSpan={3}
                                className="text-center p-4"
                            >
                                No departments found
                            </td>
                        </tr>
                    ) : (
                        departments.map((d) => (
                            <tr key={d.id}>
                                <td className="p-2 border text-center">
                                    {d.name}
                                </td>
                                <td className="p-2 border text-center">
                                    {d.description}
                                </td>
                                <td className="p-2 border text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() =>
                                                handleEdit(d)
                                            }
                                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(d.id)
                                            }
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
            <div className="flex justify-center items-center gap-4 mt-4">
                <button
                    disabled={currentPage === 0}
                    onClick={() =>
                        setCurrentPage((prev) => prev - 1)
                    }
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span>
                    Page {currentPage + 1} / {totalPages}
                </span>

                <button
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() =>
                        setCurrentPage((prev) => prev + 1)
                    }
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* FORM MODAL */}
            <DepartmentForm
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setEditing(null);
                }}
                onSubmit={handleSubmit}
                editingDepartment={editing}
            />
        </div>
    );
};

export default DepartmentList;