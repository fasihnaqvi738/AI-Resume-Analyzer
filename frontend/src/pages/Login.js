import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/login",
                {
                    username,
                    password
                }
            );

            localStorage.setItem("token", response.data.access_token);
            localStorage.setItem("username", username);

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Login Failed");
        }
    };

    return (
        <main className="auth-shell">
            <section className="auth-card">
                <p className="eyebrow">Welcome back</p>
                <h1>AI Resume Analyzer</h1>
                <p className="subtle">
                    Sign in to upload resumes, compare roles, and review your saved analyses.
                </p>

                <form className="form-grid" onSubmit={handleLogin} style={{ marginTop: "24px" }}>
                    <label className="field">
                        <span>Username</span>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span>Password</span>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    <button className="btn btn-primary btn-full" type="submit">
                        Login
                    </button>
                </form>

                <p className="auth-switch">
                    New here?{" "}
                    <button type="button" onClick={() => navigate("/register")}>
                        Create an account
                    </button>
                </p>
            </section>
        </main>
    );
}

export default Login;
