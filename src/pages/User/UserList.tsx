import { useEffect, useState } from "react";
import type { UserRequest, UserResponse } from "../../types/User";
import { getUsers, createUser, deleteUser } from "../../api/userApi";
import UserForm from "./UserForm";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const UserList = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // ================= PAGINATION =================
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // ================= FILTERS =================
    const [keyword, setKeyword] = useState("");
    const [role, setRole] = useState("");
    const [enabled, setEnabled] = useState<string>("");

    // ================= STATES =================
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ================= FETCH =================
    const fetchUsers = async () => {
        try {
            setLoading(true);

            const data = await getUsers({
                page,
                size,
                keyword: keyword || undefined,
                role: role || undefined,
                enabled: enabled === "" ? undefined : enabled === "true"
            });

            setUsers(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Fetch users failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, size, keyword, role, enabled]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setPage(0);
    };

    const handleReset = () => {
        setKeyword("");
        setRole("");
        setEnabled("");
        setSize(5);
        setPage(0);
    };

    // ================= EXPORT =================
    const handleExport = async () => {
        try {
            setExporting(true);

            const res = await getUsers({
                page: 0,
                size: 9999,
                keyword: keyword || undefined,
                role: role || undefined,
                enabled: enabled === "" ? undefined : enabled === "true"
            });

            const fullData = res.content;

            if (fullData.length === 0) {
                alert("No data to export!");
                return;
            }

            const headers = [
                "Username",
                "Roles",
                "Status"
            ];

            const data = fullData.map(user => [
                user.username,
                user.roles.join(", "),
                user.enabled ? "Enabled" : "Disabled"
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

            worksheet["!cols"] = [
                { wch: 25 },
                { wch: 30 },
                { wch: 15 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const today = new Date().toISOString().split("T")[0];
            saveAs(blob, `users_${today}.xlsx`);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed!");
        } finally {
            setExporting(false);
        }
    };

    // ================= CRUD =================
    const handleSubmit = async (data: UserRequest) => {
        await createUser(data);
        setIsOpen(false);
        fetchUsers();
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        await deleteUser(id);

        if (users.length === 1 && page > 0) {
            setPage(prev => prev - 1);
        } else {
            fetchUsers();
        }
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">User List</h1>

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
                        + Add User
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">

                <input
                    type="text"
                    placeholder="Search username or employee..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border p-2 rounded w-64"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="HR">HR</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                </select>

                <select
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
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

                {/* PAGE SIZE */}
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

            {/* TOTAL RECORD */}
            <div className="mb-2 text-sm text-gray-600">
                Showing {users.length} of {totalElements} records
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">Username</th>
                        <th className="p-2 border text-center">Roles</th>
                        <th className="p-2 border text-center">Status</th>
                        <th className="p-2 border text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="text-center py-4">
                                Loading...
                            </td>
                        </tr>
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-4 text-gray-500">
                                No users found
                            </td>
                        </tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.id}>
                                <td className="p-2 border text-center">
                                    {user.username}
                                </td>

                                <td className="p-2 border text-center">
                                    {user.roles.join(", ")}
                                </td>

                                <td className="p-2 border text-center">
                                    <span
                                        className={`px-2 py-1 rounded text-white ${user.enabled
                                            ? "bg-green-600"
                                            : "bg-gray-500"
                                            }`}
                                    >
                                        {user.enabled ? "Enabled" : "Disabled"}
                                    </span>
                                </td>

                                <td className="p-2 border text-center">
                                    <button
                                        onClick={() => handleDelete(user.id)}
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

            <UserForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default UserList;