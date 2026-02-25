import { useEffect, useState } from "react";
import type {
    DepartmentRequest,
    DepartmentResponse,
} from "../../types/Department";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DepartmentRequest) => Promise<any>;
    editingDepartment?: DepartmentResponse | null;
}

const DepartmentForm = ({
    isOpen,
    onClose,
    onSubmit,
    editingDepartment,
}: Props) => {

    const [formData, setFormData] = useState<DepartmentRequest>({
        name: "",
        description: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editingDepartment) {
            setFormData({
                name: editingDepartment.name,
                description: editingDepartment.description || "",
            });
        } else {
            setFormData({
                name: "",
                description: "",
            });
        }

        setErrors({});
    }, [editingDepartment, isOpen]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });

        // Clear lỗi khi user sửa
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
            <div className="bg-white p-6 rounded w-[450px]">

                <h2 className="text-xl font-bold mb-4">
                    {editingDepartment ? "Edit Department" : "Add Department"}
                </h2>

                <div className="flex flex-col gap-3">

                    {/* Name */}
                    <div>
                        <input
                            name="name"
                            placeholder="Department Name"
                            className={inputStyle("name")}
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <textarea
                            name="description"
                            placeholder="Description"
                            className={inputStyle("description")}
                            value={formData.description}
                            onChange={handleChange}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">
                                {errors.description}
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

export default DepartmentForm;