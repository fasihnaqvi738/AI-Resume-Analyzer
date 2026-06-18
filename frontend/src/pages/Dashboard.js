import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const resultRef = useRef(null);
    const username = localStorage.getItem("username");
    const navigate = useNavigate();

    useEffect(() => {
        fetchResumes();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/");
    };

    const analyzeResume = async () => {
        if (!jobDescription.trim()) {
            alert("Please paste a Job Description");
            return;
        }

        if (!selectedResume) {
            alert("Please select a resume");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const formData = new FormData();

            formData.append("resume_id", selectedResume);
            formData.append("job_description", jobDescription);

            const response = await axios.post(
                "http://127.0.0.1:8000/ai-analyze",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAnalysisResult(response.data);

            setTimeout(() => {
                resultRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        } catch (error) {
            console.error(error);
            alert("Analysis Failed");
        } finally {
            setLoading(false);
        }
    };

    const deleteResume = async (resumeId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `http://127.0.0.1:8000/resume/${resumeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (selectedResume === resumeId) {
                setSelectedResume(null);
                setAnalysisResult(null);
            }

            fetchResumes();
        } catch (error) {
            console.error(error);
            alert("Delete Failed");
        }
    };

    const viewResume = async (resumeId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://127.0.0.1:8000/resume/${resumeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            window.open(response.data.file_url, "_blank");
        } catch (error) {
            console.error(error);
            alert("Unable to open resume");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Please enter a resume title");
            return;
        }

        if (!file) {
            alert("Please choose a resume file");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("title", title);
            formData.append("file", file);

            const token = localStorage.getItem("token");

            await axios.post(
                "http://127.0.0.1:8000/upload-resume",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchResumes();
            setTitle("");
            setFile(null);
        } catch (error) {
            console.error(error);
            alert("Upload Failed");
        }
    };

    const fetchResumes = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://127.0.0.1:8000/my-resumes",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResumes(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <main className="app-shell">
            <header className="app-topbar">
                <div>
                    <h1>AI Resume Analyzer</h1>
                    <p className="subtle">Welcome, {username || "candidate"}</p>
                </div>

                <div className="topbar-actions">
                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => navigate("/history")}
                    >
                        View Analysis History
                    </button>

                    <button
                        className="btn btn-danger"
                        type="button"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <section className="grid dashboard-grid">
                <div className="stack">
                    <div className="card">
                        <div className="section-header">
                            <div>
                                <p className="eyebrow">Step 1</p>
                                <h2>Upload Resume</h2>
                            </div>
                        </div>

                        <form className="form-grid" onSubmit={handleUpload}>
                            <label className="field">
                                <span>Resume title</span>
                                <input
                                    type="text"
                                    placeholder="Frontend Developer Resume"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </label>

                            <label className="field">
                                <span>Resume file</span>
                                <input
                                    key={file ? file.name : "empty"}
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </label>

                            <button className="btn btn-primary" type="submit">
                                Upload Resume
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <div className="section-header">
                            <div>
                                <p className="eyebrow">Step 2</p>
                                <h2>My Resumes</h2>
                            </div>
                            <p className="subtle">{resumes.length} saved</p>
                        </div>

                        {resumes.length === 0 ? (
                            <div className="empty-state">
                                Upload a resume to start comparing it against a job description.
                            </div>
                        ) : (
                            <ul className="resume-list">
                                {resumes.map((resume) => (
                                    <li className="resume-item" key={resume.id}>
                                        <div className="resume-row">
                                            <label className="resume-choice">
                                                <input
                                                    type="radio"
                                                    name="selectedResume"
                                                    checked={selectedResume === resume.id}
                                                    onChange={() => setSelectedResume(resume.id)}
                                                />
                                                <span className="resume-title">{resume.title}</span>
                                            </label>

                                            <div className="card-actions">
                                                <button
                                                    className="btn btn-secondary"
                                                    type="button"
                                                    onClick={() => viewResume(resume.id)}
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="btn btn-danger"
                                                    type="button"
                                                    onClick={() => deleteResume(resume.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="stack job-description-stack">
                    <div className="card job-description-card">
                        <div className="section-header">
                            <div>
                                <p className="eyebrow">Step 3</p>
                                <h2>Job Description</h2>
                            </div>
                        </div>

                        <label className="field">
                            <span>Paste the target role details</span>
                            <textarea
                                placeholder="Paste Job Description Here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </label>

                        <div className="button-row analyze-action-row">
                            <button
                                className="btn btn-warning"
                                type="button"
                                onClick={analyzeResume}
                                disabled={loading}
                            >
                                {loading ? "Analyzing..." : "Analyze Selected Resume"}
                            </button>
                        </div>

                        {loading && (
                            <div className="loader">
                                <div className="spinner" />
                                <span>Analyzing Resume...</span>
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {analysisResult && (
                <section className="card analysis-result-card" ref={resultRef}>
                    <div className="section-header">
                        <div>
                            <p className="eyebrow">Result</p>
                            <h2>Analysis Result</h2>
                        </div>
                        <div className="metric">
                            <span>ATS</span>
                            <strong>{analysisResult.ats_score}</strong>
                        </div>
                    </div>

                    <div className="result-grid">
                        <div className="result-panel">
                            <h4>Matched Skills</h4>
                            <ul className="pill-list">
                                {analysisResult.matched_skills.map((skill, index) => (
                                    <li className="pill" key={index}>
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="result-panel">
                            <h4>Missing Skills</h4>
                            <ul className="pill-list">
                                {analysisResult.missing_skills.map((skill, index) => (
                                    <li className="pill pill-danger" key={index}>
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="result-panel">
                            <h4>Suggestions</h4>
                            <ul className="suggestions">
                                {analysisResult.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

export default Dashboard;
