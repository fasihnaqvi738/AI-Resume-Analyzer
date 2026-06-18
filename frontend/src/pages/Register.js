import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/register",
                {
                    username,
                    email,
                    password
                }
            );

            alert("Registration Successful");
            console.log(response.data);
            navigate("/");
        } catch (error) {
            console.error(error);
            alert("Registration Failed");
        }
    };

    return (
        <main className="auth-shell">
            <section className="auth-card">
                <p className="eyebrow">Create account</p>
                <h1>Start analyzing smarter</h1>
                <p className="subtle">
                    Save resumes, track analysis history, and compare each resume to the role that matters.
                </p>

                <form className="form-grid" onSubmit={handleRegister} style={{ marginTop: "24px" }}>
                    <label className="field">
                        <span>Username</span>
                        <input
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span>Email</span>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label className="field">
                        <span>Password</span>
                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    <button className="btn btn-primary btn-full" type="submit">
                        Register
                    </button>
                </form>

                <p className="auth-switch">
                    Already registered?{" "}
                    <button type="button" onClick={() => navigate("/")}>
                        Back to login
                    </button>
                </p>
            </section>
        </main>
    );
}

export default Register;
