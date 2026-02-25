import { useEffect, useState } from "react";
import type { PositionRequest, PositionResponse } from "../../types/Position";


interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PositionRequest) => void;
    editingPosition?: PositionResponse | null;
}

const PositionForm = ({ isOpen, onClose, onSubmit, editingPosition }: Props) => {
    const [formData, setFormData] = useState<PositionRequest>({
        name: "",
        baseSalary: 0
    });

    useEffect(() => {
        if (editingPosition) {
            setFormData({
                name: editingPosition.name,
                baseSalary: editingPosition.baseSalary
            });
        }
    }, [editingPosition]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === "baseSalary" ? Number(value) : value
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[400px]">
                <h2 className="text-xl font-bold mb-4">
                    {editingPosition ? "Edit Position" : "Add Position"}
                </h2>

                <div className="flex flex-col gap-3">
                    <input
                        name="name"
                        placeholder="Position Name"
                        className="border p-2"
                        value={formData.name}
                        onChange={handleChange}
                    />

                    <input
                        name="baseSalary"
                        type="number"
                        placeholder="Base Salary"
                        className="border p-2"
                        value={formData.baseSalary}
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
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PositionForm;
