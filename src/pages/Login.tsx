import { useState } from "react";
import { loginApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await loginApi({ username, password });

            // Lưu localStorage
            localStorage.setItem("token", response.token);
            localStorage.setItem("username", response.username);
            localStorage.setItem(
                "roles",
                JSON.stringify(response.roles)
            );

            navigate("/");
        } catch (error) {
            alert("Invalid username or password");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    HRM Login
                </h2>

                <input
                    className="border p-2 w-full mb-3 rounded"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    className="border p-2 w-full mb-4 rounded"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default Login;