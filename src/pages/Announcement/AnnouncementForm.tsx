import { useEffect, useState } from "react";
import type { AnnouncementRequest } from "../../types/Announcement";
import type { EmployeeResponse } from "../../types/Employee";
import { getEmployees } from "../../api/employeeApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AnnouncementRequest) => Promise<any>; // ⚠️ sửa thành Promise
}

const AnnouncementForm = ({
    isOpen,
    onClose,
    onSubmit,
}: Props) => {

    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

    const [formData, setFormData] = useState<AnnouncementRequest>({
        title: "",
        content: "",
        createdBy: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }

        // reset form khi mở
        setFormData({
            title: "",
            content: "",
            createdBy: 0,
        });

        setErrors({});
    }, [isOpen]);

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === "createdBy" ? Number(value) : value,
        });

        // clear lỗi khi sửa
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
            <div className="bg-white p-6 rounded w-[550px]">
                <h2 className="text-xl font-bold mb-4">
                    Add Announcement
                </h2>

                <div className="grid grid-cols-1 gap-3">

                    {/* Title */}
                    <div>
                        <input
                            name="title"
                            placeholder="Title"
                            className={inputStyle("title")}
                            value={formData.title}
                            onChange={handleChange}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <textarea
                            name="content"
                            placeholder="Content"
                            className={`${inputStyle("content")} h-28`}
                            value={formData.content}
                            onChange={handleChange}
                        />
                        {errors.content && (
                            <p className="text-red-500 text-sm">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    {/* Created By */}
                    <div>
                        <select
                            name="createdBy"
                            className={inputStyle("createdBy")}
                            value={formData.createdBy}
                            onChange={handleChange}
                        >
                            <option value={0}>Select Author</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                        {errors.createdBy && (
                            <p className="text-red-500 text-sm">
                                {errors.createdBy}
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

export default AnnouncementForm;