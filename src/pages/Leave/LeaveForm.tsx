import { useState, useEffect } from "react";
import type { LeaveRequest } from "../../types/Leave";
import type { EmployeeResponse } from "../../types/Employee";
import { getEmployees } from "../../api/employeeApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LeaveRequest) => Promise<any>;
}

const LeaveForm = ({ isOpen, onClose, onSubmit }: Props) => {

    const initialState: LeaveRequest = {
        employeeId: 0,
        startDate: "",
        endDate: "",
        reason: "",
    };

    const [formData, setFormData] = useState<LeaveRequest>(initialState);
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        } else {
            setFormData(initialState);
            setErrors({});
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            setLoadingEmployees(true);
            const data = await getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === "employeeId" ? Number(value) : value,
        }));

        setErrors(prev => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleSubmit = async () => {
        try {
            await onSubmit(formData);
            setErrors({});
            onClose();
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        }
    };

    const inputStyle = (field: string) =>
        `border p-2 w-full rounded ${errors[field] ? "border-red-500" : ""
        }`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[450px] shadow-lg">

                <h2 className="text-xl font-bold mb-4">
                    Request Leave
                </h2>

                <div className="grid gap-3">

                    {/* Employee Dropdown */}
                    <div>
                        <select
                            name="employeeId"
                            className={inputStyle("employeeId")}
                            value={formData.employeeId}
                            onChange={handleChange}
                            disabled={loadingEmployees}
                        >
                            <option value={0}>
                                {loadingEmployees
                                    ? "Loading employees..."
                                    : "-- Select Employee --"}
                            </option>

                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.id} - {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>

                        {errors.employeeId && (
                            <p className="text-red-500 text-sm">
                                {errors.employeeId}
                            </p>
                        )}
                    </div>

                    {/* Start Date */}
                    <div>
                        <input
                            type="date"
                            name="startDate"
                            className={inputStyle("startDate")}
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                        {errors.startDate && (
                            <p className="text-red-500 text-sm">
                                {errors.startDate}
                            </p>
                        )}
                    </div>

                    {/* End Date */}
                    <div>
                        <input
                            type="date"
                            name="endDate"
                            className={inputStyle("endDate")}
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                        {errors.endDate && (
                            <p className="text-red-500 text-sm">
                                {errors.endDate}
                            </p>
                        )}
                    </div>

                    {/* Reason */}
                    <div>
                        <input
                            type="text"
                            name="reason"
                            placeholder="Reason"
                            className={inputStyle("reason")}
                            value={formData.reason}
                            onChange={handleChange}
                        />
                        {errors.reason && (
                            <p className="text-red-500 text-sm">
                                {errors.reason}
                            </p>
                        )}
                    </div>

                </div>

                <div className="flex justify-end mt-4 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Submit
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LeaveForm;
