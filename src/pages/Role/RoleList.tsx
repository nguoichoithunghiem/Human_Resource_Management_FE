import { useEffect, useState } from "react";
import RoleForm from "./RoleForm";
import type { RoleResponse } from "../../types/Role";
import {
    createRole,
    deleteRole,
    getRoles,
    updateRole,
} from "../../api/roleApi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const RoleList = () => {
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // 🔎 Search + Sort
    const [keyword, setKeyword] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // 📄 Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchRoles = async () => {
        try {
            setLoading(true);

            const data = await getRoles({
                keyword,
                page,
                size: pageSize,
                sortBy,
                sortDir,
            });

            setRoles(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Fetch roles failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Auto fetch when dependency changes
    useEffect(() => {
        fetchRoles();
    }, [page, pageSize, keyword, sortBy, sortDir]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setPage(0);
    };

    const handleReset = () => {
        setKeyword("");
        setSortBy("id");
        setSortDir("asc");
        setPageSize(5);
        setPage(0);
    };

    // ================= EXPORT =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const res = await getRoles({
                keyword,
                page: 0,
                size: 9999,
                sortBy,
                sortDir,
            });

            const fullData = res.content;

            if (fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const headers = ["ID", "Role Name"];

            const data = fullData.map(r => [
                r.id,
                r.name
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

            worksheet["!cols"] = [
                { wch: 10 },
                { wch: 30 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            saveAs(blob, "roles.xlsx");

        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= CRUD =================
    const handleSubmit = async (name: string) => {
        if (editingRole) {
            await updateRole(editingRole.id, name);
        } else {
            await createRole(name);
        }

        setIsOpen(false);
        setEditingRole(null);
        fetchRoles();
    };

    const handleEdit = (role: RoleResponse) => {
        setEditingRole(role);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure to delete this role?"))
            return;

        await deleteRole(id);

        if (roles.length === 1 && page > 0) {
            setPage(prev => prev - 1);
        } else {
            fetchRoles();
        }
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Role Management</h1>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {exporting ? "Exporting..." : "Export Excel"}
                    </button>

                    <button
                        onClick={() => {
                            setEditingRole(null);
                            setIsOpen(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* SEARCH + SORT + PAGE SIZE */}
            <div className="bg-gray-100 p-4 rounded mb-4 flex gap-4 items-center flex-wrap">

                <input
                    type="text"
                    placeholder="Search role..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border p-2 rounded w-60"
                />

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="id">Sort by ID</option>
                    <option value="name">Sort by Name</option>
                </select>

                <select
                    value={sortDir}
                    onChange={(e) =>
                        setSortDir(e.target.value as "asc" | "desc")
                    }
                    className="border p-2 rounded"
                >
                    <option value="asc">ASC</option>
                    <option value="desc">DESC</option>
                </select>



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

            {/* TOTAL RECORD */}
            <div className="mb-2 text-sm text-gray-600">
                Showing {roles.length} of {totalElements} records
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">ID</th>
                        <th className="p-2 border text-center">Name</th>
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
                    ) : roles.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center p-4">
                                No roles found
                            </td>
                        </tr>
                    ) : (
                        roles.map(role => (
                            <tr key={role.id}>
                                <td className="p-2 border text-center">
                                    {role.id}
                                </td>
                                <td className="p-2 border text-center font-semibold">
                                    {role.name}
                                </td>
                                <td className="p-2 border text-center flex gap-2 justify-center">
                                    <button
                                        onClick={() => handleEdit(role)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-center items-center mt-4 gap-2">
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

            <RoleForm
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setEditingRole(null);
                }}
                onSubmit={handleSubmit}
                editingRole={editingRole}
            />
        </div>
    );
};

export default RoleList;