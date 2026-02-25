import { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";
import type { EmployeeRequest, EmployeeResponse } from "../../types/Employee";
import {
    createEmployee,
    deleteEmployee,
    updateEmployee,
    searchEmployees
} from "../../api/employeeApi";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const EmployeeList = () => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [editingEmployee, setEditingEmployee] =
        useState<EmployeeResponse | null>(null);
    const [viewEmployee, setViewEmployee] =
        useState<EmployeeResponse | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // ================= SEARCH + FILTER =================
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");

    // ================= PAGINATION =================
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(false);

    // ================= FETCH =================
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await searchEmployees({
                keyword,
                status,
                page: currentPage,
                size: pageSize,
                sortBy: "id",
                sortDir: "asc"
            });

            setEmployees(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Fetch employees failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [currentPage, pageSize]);

    // ================= SEARCH =================
    const handleSearch = () => {
        setCurrentPage(0);
        fetchEmployees();
    };

    const handleReset = () => {
        setKeyword("");
        setStatus("");
        setPageSize(5);
        setCurrentPage(0);
    };

    // ================= EXPORT =================
    const handleExport = () => {
        if (employees.length === 0) {
            alert("No data to export!");
            return;
        }

        const headers = [
            "Code",
            "Name",
            "Email",
            "Phone",
            "Gender",
            "Date of Birth",
            "Hire Date",
            "Status",
            "Department",
            "Position"
        ];

        const data = employees.map(emp => [
            emp.employeeCode,
            `${emp.firstName} ${emp.lastName}`,
            emp.email,
            emp.phone,
            emp.gender,
            emp.dateOfBirth,
            emp.hireDate,
            emp.status,
            emp.departmentName,
            emp.positionName
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        worksheet["!cols"] = headers.map(() => ({ wch: 18 }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const fileData = new Blob([excelBuffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        saveAs(fileData, "employees.xlsx");
    };

    // ================= CRUD =================
    const handleSubmit = async (data: EmployeeRequest) => {
        if (editingEmployee) {
            await updateEmployee(editingEmployee.id, data);
        } else {
            await createEmployee(data);
        }

        setIsOpen(false);
        setEditingEmployee(null);
        fetchEmployees();
    };

    const handleEdit = (employee: EmployeeResponse) => {
        setEditingEmployee(employee);
        setIsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this employee?"))
            return;

        await deleteEmployee(id);

        if (employees.length === 1 && currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        } else {
            fetchEmployees();
        }
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Employee List</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={handleExport}
                        className="bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Export Excel
                    </button>
                    <button
                        onClick={() => {
                            setEditingEmployee(null);
                            setIsOpen(true);
                        }}
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
                    placeholder="Search..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border px-3 py-2 rounded w-64"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border px-3 py-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
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
                Showing {employees.length} of {totalElements} records
            </div>

            {/* TABLE */}
            <table className="w-full border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border text-center">Code</th>
                        <th className="p-2 border text-center">Name</th>
                        <th className="p-2 border text-center">Email</th>
                        <th className="p-2 border text-center">Department</th>
                        <th className="p-2 border text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4">
                                Loading...
                            </td>
                        </tr>
                    ) : employees.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center p-4">
                                No data found
                            </td>
                        </tr>
                    ) : (
                        employees.map(emp => (
                            <tr key={emp.id}>
                                <td className="p-2 border text-center">
                                    {emp.employeeCode}
                                </td>
                                <td className="p-2 border text-center">
                                    {emp.firstName} {emp.lastName}
                                </td>
                                <td className="p-2 border text-center">
                                    {emp.email}
                                </td>
                                <td className="p-2 border text-center">
                                    {emp.departmentName}
                                </td>
                                <td className="p-2 border text-center">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() =>
                                                setViewEmployee(emp)
                                            }
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(emp.id)
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
                        setCurrentPage(prev => prev - 1)
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
                        setCurrentPage(prev => prev + 1)
                    }
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            {/* VIEW MODAL */}
            {viewEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-[500px]">
                        <h2 className="text-xl font-bold mb-4">
                            Employee Detail
                        </h2>

                        <div className="space-y-2">
                            <p><strong>Code:</strong> {viewEmployee.employeeCode}</p>
                            <p><strong>Name:</strong> {viewEmployee.firstName} {viewEmployee.lastName}</p>
                            <p><strong>Email:</strong> {viewEmployee.email}</p>
                            <p><strong>Phone:</strong> {viewEmployee.phone}</p>
                            <p><strong>Gender:</strong> {viewEmployee.gender}</p>
                            <p><strong>Date of Birth:</strong> {viewEmployee.dateOfBirth}</p>
                            <p><strong>Hire Date:</strong> {viewEmployee.hireDate}</p>
                            <p><strong>Status:</strong> {viewEmployee.status}</p>
                            <p><strong>Department:</strong> {viewEmployee.departmentName}</p>
                            <p><strong>Position:</strong> {viewEmployee.positionName}</p>
                        </div>

                        <div className="mt-4 text-right">
                            <button
                                onClick={() => setViewEmployee(null)}
                                className="bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM MODAL */}
            <EmployeeForm
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setEditingEmployee(null);
                }}
                onSubmit={handleSubmit}
                editingEmployee={editingEmployee}
            />
        </div>
    );
};

export default EmployeeList;

