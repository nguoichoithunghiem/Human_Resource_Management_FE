import { useEffect, useState } from "react";
import type { SalaryHistoryRequest } from "../../types/SalaryHistory";
import type { EmployeeResponse } from "../../types/Employee";
import { getEmployees } from "../../api/employeeApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SalaryHistoryRequest) => Promise<any>; // ⚠️ sửa thành Promise
}

const SalaryHistoryForm = ({
    isOpen,
    onClose,
    onSubmit,
}: Props) => {

    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

    const [formData, setFormData] = useState<SalaryHistoryRequest>({
        employeeId: 0,
        oldSalary: 0,
        newSalary: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }

        // reset form khi mở
        setFormData({
            employeeId: 0,
            oldSalary: 0,
            newSalary: 0,
        });

        setErrors({});
    }, [isOpen]);

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: Number(value),
        });

        // clear lỗi field đang sửa
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
        `border p-2 rounded w-full ${errors[field] ? "border-red-500" : ""
        }`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[500px]">
                <h2 className="text-xl font-bold mb-4">
                    Add Salary Change
                </h2>

                <div className="grid grid-cols-1 gap-3">

                    {/* Employee */}
                    <div>
                        <select
                            name="employeeId"
                            className={inputStyle("employeeId")}
                            value={formData.employeeId}
                            onChange={handleChange}
                        >
                            <option value={0}>Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                        {errors.employeeId && (
                            <p className="text-red-500 text-sm">
                                {errors.employeeId}
                            </p>
                        )}
                    </div>

                    {/* Old Salary */}
                    <div>
                        <input
                            type="number"
                            name="oldSalary"
                            placeholder="Old Salary"
                            className={inputStyle("oldSalary")}
                            value={formData.oldSalary}
                            onChange={handleChange}
                        />
                        {errors.oldSalary && (
                            <p className="text-red-500 text-sm">
                                {errors.oldSalary}
                            </p>
                        )}
                    </div>

                    {/* New Salary */}
                    <div>
                        <input
                            type="number"
                            name="newSalary"
                            placeholder="New Salary"
                            className={inputStyle("newSalary")}
                            value={formData.newSalary}
                            onChange={handleChange}
                        />
                        {errors.newSalary && (
                            <p className="text-red-500 text-sm">
                                {errors.newSalary}
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
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalaryHistoryForm;