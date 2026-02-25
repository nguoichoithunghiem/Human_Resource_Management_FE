import { useEffect, useState } from "react";
import type { UserRequest } from "../../types/User";
import type { EmployeeResponse } from "../../types/Employee";
import { getEmployees } from "../../api/employeeApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserRequest) => Promise<any>; // ⚠️ sửa thành Promise
}

const UserForm = ({ isOpen, onClose, onSubmit }: Props) => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

    const [formData, setFormData] = useState<UserRequest>({
        username: "",
        password: "",
        employeeId: 0,
        roles: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }

        // reset form khi mở modal
        setFormData({
            username: "",
            password: "",
            employeeId: 0,
            roles: [],
        });

        setErrors({});
    }, [isOpen]);

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "employeeId") {
            setFormData({ ...formData, employeeId: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // clear lỗi field đang sửa
        setErrors(prev => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleRoleChange = (role: string) => {
        setFormData({ ...formData, roles: [role] });

        setErrors(prev => ({
            ...prev,
            roles: "",
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[450px]">
                <h2 className="text-xl font-bold mb-4">Create User</h2>

                <div className="flex flex-col gap-3">

                    {/* Username */}
                    <div>
                        <input
                            name="username"
                            placeholder="Username"
                            className={inputStyle("username")}
                            value={formData.username}
                            onChange={handleChange}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className={inputStyle("password")}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">
                                {errors.password}
                            </p>
                        )}
                    </div>

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

                    {/* Roles */}
                    <div className="flex flex-col gap-2">
                        <label>
                            <input
                                type="radio"
                                checked={formData.roles.includes("ADMIN")}
                                onChange={() => handleRoleChange("ADMIN")}
                            />
                            ADMIN
                        </label>

                        <label>
                            <input
                                type="radio"
                                checked={formData.roles.includes("USER")}
                                onChange={() => handleRoleChange("USER")}
                            />
                            USER
                        </label>

                        <label>
                            <input
                                type="radio"
                                checked={formData.roles.includes("MANAGER")}
                                onChange={() => handleRoleChange("MANAGER")}
                            />
                            MANAGER
                        </label>

                        {errors.roles && (
                            <p className="text-red-500 text-sm">
                                {errors.roles}
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

export default UserForm;