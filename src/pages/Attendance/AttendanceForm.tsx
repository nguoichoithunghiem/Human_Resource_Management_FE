import { useEffect, useState } from "react";
import type { AttendanceRequest } from "../../types/Attendance";
import type { EmployeeResponse } from "../../types/Employee";
import { getEmployees } from "../../api/employeeApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AttendanceRequest) => void;
}

const AttendanceForm = ({ isOpen, onClose, onSubmit }: Props) => {
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [employeeId, setEmployeeId] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center" >
            <div className="bg-white p-6 rounded w-[400px]" >
                <h2 className="text-xl font-bold mb-4" > Check In </h2>

                < select
                    className="border p-2 w-full"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(Number(e.target.value))}
                >
                    <option value={0}> Select Employee </option>
                    {
                        employees.map(emp => (
                            <option key={emp.id} value={emp.id} >
                                {emp.firstName} {emp.lastName}
                            </option>
                        ))
                    }
                </select>

                < div className="flex justify-end mt-4 gap-3" >
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                        Cancel
                    </button>

                    < button
                        onClick={() => onSubmit({ employeeId })}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Check In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceForm;
