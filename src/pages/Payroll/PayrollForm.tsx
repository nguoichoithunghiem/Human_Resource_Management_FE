import { useEffect, useState } from "react";
import type { PayrollRequest } from "../../types/Payroll";

import type { EmployeeResponse } from "../../types/Employee";
import { getEmployees } from "../../api/employeeApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PayrollRequest) => void;
}

const PayrollForm = ({ isOpen, onClose, onSubmit }: Props) => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<PayrollRequest>({
        employeeId: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: 0,
        deduction: 0,
    });

    // ✅ Fetch employee khi mở modal
    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        } else {
            resetForm();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            bonus: 0,
            deduction: 0,
        });
    };

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: Number(value),
        });
    };

    const handleEmployeeChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            employeeId: Number(e.target.value),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[500px]">
                <h2 className="text-xl font-bold mb-4">
                    Calculate Payroll
                </h2>

                <div className="grid gap-3">

                    {/* ✅ Dropdown Employee */}
                    <select
                        className="border p-2"
                        value={formData.employeeId}
                        onChange={handleEmployeeChange}
                    >
                        <option value={0}>
                            {loading ? "Loading..." : "Select Employee"}
                        </option>

                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="month"
                        className="border p-2"
                        value={formData.month}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="year"
                        className="border p-2"
                        value={formData.year}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="bonus"
                        placeholder="Bonus"
                        className="border p-2"
                        value={formData.bonus}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="deduction"
                        placeholder="Deduction"
                        className="border p-2"
                        value={formData.deduction}
                        onChange={handleChange}
                    />

                </div>

                <div className="flex justify-end mt-4 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSubmit(formData)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        disabled={!formData.employeeId}
                    >
                        Calculate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayrollForm;
