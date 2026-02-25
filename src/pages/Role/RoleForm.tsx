import { useEffect, useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    editingRole?: { id: number; name: string } | null;
}

const RoleForm = ({
    isOpen,
    onClose,
    onSubmit,
    editingRole,
}: Props) => {

    const [name, setName] = useState("");

    useEffect(() => {
        if (editingRole) {
            setName(editingRole.name);
        } else {
            setName("");
        }
    }, [editingRole, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-[400px]">
                <h2 className="text-xl font-bold mb-4">
                    {editingRole ? "Edit Role" : "Add Role"}
                </h2>

                <input
                    type="text"
                    placeholder="Role Name (ADMIN, HR...)"
                    className="border p-2 w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div className="flex justify-end mt-4 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSubmit(name)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleForm;
