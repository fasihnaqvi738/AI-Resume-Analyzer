import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function History() {
    const [analyses, setAnalyses] = useState([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const viewAnalysis = async (analysisId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://127.0.0.1:8000/analysis/${analysisId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSelectedAnalysis(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://127.0.0.1:8000/analysis-history",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAnalyses(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteAnalysis = async (analysisId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `http://127.0.0.1:8000/analysis/${analysisId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (selectedAnalysis?.id === analysisId) {
                setSelectedAnalysis(null);
            }

            fetchHistory();
        } catch (error) {
            console.error(error);
            alert("Delete Failed");
        }
    };

    return (
        <main className="app-shell">
            <header className="app-topbar">
                <div>
                    <p className="eyebrow">Saved insights</p>
                    <h1>Analysis History</h1>
                    <p className="subtle">Review previous ATS scores and improvement notes.</p>
                </div>

                <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
            </header>

            <section className="card">
                <div className="section-header">
                    <div>
                        <h2>Past analyses</h2>
                        <p className="subtle">{analyses.length} total records</p>
                    </div>
                </div>

                {analyses.length === 0 ? (
                    <div className="empty-state">No analyses found yet.</div>
                ) : (
                    <ul className="history-list">
                        {analyses.map((analysis) => (
                            <li className="history-item" key={analysis.id}>
                                <div className="history-row">
                                    <div>
                                        <h3>Resume: {analysis.resume_title}</h3>
                                        <p className="subtle">Date: {analysis.created_at}</p>
                                    </div>

                                    <div className="metric">
                                        <span>ATS</span>
                                        <strong>{analysis.ats_score}</strong>
                                    </div>

                                    <div className="card-actions">
                                        <button
                                            className="btn btn-primary"
                                            type="button"
                                            onClick={() => viewAnalysis(analysis.id)}
                                        >
                                            View Full Analysis
                                        </button>

                                        <button
                                            className="btn btn-danger"
                                            type="button"
                                            onClick={() => deleteAnalysis(analysis.id)}
                                        >
                                            Delete Analysis
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {selectedAnalysis && (
                <div className="modal-backdrop">
                    <section className="modal">
                        <div className="section-header">
                            <div>
                                <p className="eyebrow">Full analysis</p>
                                <h2>ATS Score: {selectedAnalysis.ats_score}</h2>
                            </div>

                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => setSelectedAnalysis(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="result-grid">
                            <div className="result-panel">
                                <h3>Matched Skills</h3>
                                <ul className="pill-list">
                                    {selectedAnalysis.result_json.matched_skills?.map((skill, index) => (
                                        <li className="pill" key={index}>
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="result-panel">
                                <h3>Missing Skills</h3>
                                <ul className="pill-list">
                                    {selectedAnalysis.result_json.missing_skills?.map((skill, index) => (
                                        <li className="pill pill-danger" key={index}>
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="result-panel">
                                <h3>Suggestions</h3>
                                <ul className="suggestions">
                                    {selectedAnalysis.result_json.suggestions?.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

export default History;
