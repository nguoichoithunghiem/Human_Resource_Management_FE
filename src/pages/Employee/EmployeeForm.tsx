import { useState, useEffect } from "react";
import type { EmployeeRequest, EmployeeResponse } from "../../types/Employee";
import type { DepartmentResponse } from "../../types/Department";
import type { PositionResponse } from "../../types/Position";
import { getDepartments } from "../../api/departmentApi";
import { getPositions } from "../../api/positionApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeRequest) => Promise<any>;
    editingEmployee?: EmployeeResponse | null;
}

const EmployeeForm = ({
    isOpen,
    onClose,
    onSubmit,
    editingEmployee,
}: Props) => {

    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [positions, setPositions] = useState<PositionResponse[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialState: EmployeeRequest = {
        employeeCode: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "MALE",
        dateOfBirth: "",
        hireDate: "",
        status: "ACTIVE",
        departmentId: 0,
        positionId: 0,
    };

    const [formData, setFormData] = useState<EmployeeRequest>(initialState);

    // 🔥 Fetch dropdown
    useEffect(() => {
        if (isOpen) {
            fetchDropdown();
        }
    }, [isOpen]);

    const fetchDropdown = async () => {
        const dept = await getDepartments();
        const pos = await getPositions();
        setDepartments(dept);
        setPositions(pos);
    };

    // 🔥 Set data khi edit
    useEffect(() => {
        if (editingEmployee && departments.length > 0 && positions.length > 0) {

            const dept = departments.find(
                d => d.name === editingEmployee.departmentName
            );

            const pos = positions.find(
                p => p.name === editingEmployee.positionName
            );

            setFormData({
                employeeCode: editingEmployee.employeeCode,
                firstName: editingEmployee.firstName,
                lastName: editingEmployee.lastName,
                email: editingEmployee.email,
                phone: editingEmployee.phone,
                gender: editingEmployee.gender,
                dateOfBirth: editingEmployee.dateOfBirth,
                hireDate: editingEmployee.hireDate,
                status: editingEmployee.status,
                departmentId: dept ? dept.id : 0,
                positionId: pos ? pos.id : 0,
            });

        } else if (!editingEmployee) {
            setFormData(initialState);
        }

        setErrors({});
    }, [editingEmployee, departments, positions, isOpen]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name.includes("Id") ? Number(value) : value,
        });

        // Clear error khi user sửa
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
        `border p-2 w-full ${errors[field] ? "border-red-500" : ""
        }`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[600px]">

                <h2 className="text-xl font-bold mb-4">
                    {editingEmployee ? "Edit Employee" : "Add Employee"}
                </h2>

                <div className="grid grid-cols-2 gap-3">

                    {/* Employee Code */}
                    <div>
                        <input
                            name="employeeCode"
                            placeholder="Code"
                            className={inputStyle("employeeCode")}
                            value={formData.employeeCode}
                            onChange={handleChange}
                        />
                        {errors.employeeCode && (
                            <p className="text-red-500 text-sm">
                                {errors.employeeCode}
                            </p>
                        )}
                    </div>

                    {/* First Name */}
                    <div>
                        <input
                            name="firstName"
                            placeholder="First Name"
                            className={inputStyle("firstName")}
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm">
                                {errors.firstName}
                            </p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <input
                            name="lastName"
                            placeholder="Last Name"
                            className={inputStyle("lastName")}
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm">
                                {errors.lastName}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            name="email"
                            placeholder="Email"
                            className={inputStyle("email")}
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <input
                            name="phone"
                            placeholder="Phone"
                            className={inputStyle("phone")}
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <select
                            name="gender"
                            className={inputStyle("gender")}
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </select>
                        {errors.gender && (
                            <p className="text-red-500 text-sm">
                                {errors.gender}
                            </p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <input
                            type="date"
                            name="dateOfBirth"
                            className={inputStyle("dateOfBirth")}
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                        />
                        {errors.dateOfBirth && (
                            <p className="text-red-500 text-sm">
                                {errors.dateOfBirth}
                            </p>
                        )}
                    </div>

                    {/* Hire Date */}
                    <div>
                        <input
                            type="date"
                            name="hireDate"
                            className={inputStyle("hireDate")}
                            value={formData.hireDate}
                            onChange={handleChange}
                        />
                        {errors.hireDate && (
                            <p className="text-red-500 text-sm">
                                {errors.hireDate}
                            </p>
                        )}
                    </div>

                    {/* Department */}
                    <div>
                        <select
                            name="departmentId"
                            className={inputStyle("departmentId")}
                            value={formData.departmentId}
                            onChange={handleChange}
                        >
                            <option value={0}>Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                        {errors.departmentId && (
                            <p className="text-red-500 text-sm">
                                {errors.departmentId}
                            </p>
                        )}
                    </div>

                    {/* Position */}
                    <div>
                        <select
                            name="positionId"
                            className={inputStyle("positionId")}
                            value={formData.positionId}
                            onChange={handleChange}
                        >
                            <option value={0}>Select Position</option>
                            {positions.map(pos => (
                                <option key={pos.id} value={pos.id}>
                                    {pos.name}
                                </option>
                            ))}
                        </select>
                        {errors.positionId && (
                            <p className="text-red-500 text-sm">
                                {errors.positionId}
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

export default EmployeeForm;