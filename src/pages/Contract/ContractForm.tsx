import { useEffect, useState } from "react";
import type { ContractRequest } from "../../types/Contract";
import type { EmployeeResponse } from "../../types/Employee";
import { getEmployees } from "../../api/employeeApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ContractRequest) => Promise<any>;
}

const ContractForm = ({ isOpen, onClose, onSubmit }: Props) => {

    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<ContractRequest>({
        employeeId: 0,
        contractType: "",
        startDate: "",
        endDate: "",
        salary: 0
    });

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]:
                name === "employeeId"
                    ? Number(value)
                    : name === "salary"
                        ? Number(value)
                        : value
        });

        // clear error khi user sửa
        setErrors(prev => ({
            ...prev,
            [name]: ""
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

    if (!isOpen) return null;

    const inputStyle = (field: string) =>
        `border p-2 ${errors[field] ? "border-red-500" : ""}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[500px]">

                <h2 className="text-xl font-bold mb-4">Add Contract</h2>

                <div className="grid gap-3">

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

                    {/* Contract Type */}
                    <div>
                        <select
                            name="contractType"
                            className={inputStyle("contractType")}
                            value={formData.contractType}
                            onChange={handleChange}
                        >
                            <option value="">Select Contract Type</option>
                            <option value="INTERN">INTERN</option>
                            <option value="PROBATION">PROBATION</option>
                            <option value="OFFICIAL">OFFICIAL</option>
                        </select>
                        {errors.contractType && (
                            <p className="text-red-500 text-sm">
                                {errors.contractType}
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

                    {/* Salary */}
                    <div>
                        <input
                            type="number"
                            name="salary"
                            placeholder="Salary"
                            className={inputStyle("salary")}
                            value={formData.salary}
                            onChange={handleChange}
                        />
                        {errors.salary && (
                            <p className="text-red-500 text-sm">
                                {errors.salary}
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

export default ContractForm;