import React, { useState, useContext, useRef } from "react";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { UploadCloud, CheckCircle2, AlertCircle, Plus, X, FileText } from "lucide-react";

export default function UploadResume() {
  const { token, user, setUser } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("skills", skills.join(","));

    try {
      const res = await fetch(`${BACKEND_URL}/api/resumes/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setFile(null);
        setSkills([]);
        if (user) {
          setUser({ ...user, resumePath: data.user.resumePath, skills: data.user.skills });
        }
      } else {
        setError(data.error || "Failed to upload resume.");
      }
    } catch (err) {
      console.error(err);
      setError("Error occurred during resume upload.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertCircle size={48} style={{ color: "var(--accent-red)", marginBottom: "20px" }} />
        <h2>Authentication Required</h2>
        <p style={{ color: "var(--text-grey)", marginTop: "8px" }}>Please login or register to upload your resume.</p>
      </div>
    );
  }

  return (
    <div className="upload-page" style={{ maxWidth: "650px", margin: "0 auto" }}>
      <div className="glass-card" style={{ padding: "35px" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
          <FileText size={28} style={{ color: "var(--accent-gold)" }} /> Upload Your Resume
        </h2>
        <p className="subtitle">Showcase your technical skills and resume details to recruiters</p>

        {success && (
          <div className="file-selected-alert" style={{ background: "rgba(0, 230, 118, 0.1)", border: "1px solid rgba(0, 230, 118, 0.3)", color: "#c7ffd4", marginBottom: "20px" }}>
            <CheckCircle2 size={16} />
            <span>Resume uploaded successfully! Opportunity matching is now active.</span>
          </div>
        )}

        {error && (
          <div className="file-selected-alert" style={{ background: "rgba(255, 74, 90, 0.1)", border: "1px solid rgba(255, 74, 90, 0.3)", color: "#ffb3b8", marginBottom: "20px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className={`uploader-box ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <UploadCloud size={48} className="uploader-icon" style={{ margin: "0 auto 16px auto" }} />
            <p>Drag and drop your resume file here</p>
            <span>Supports: PDF, DOC, DOCX files</span>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="file-selected-alert" style={{ background: "rgba(255, 185, 71, 0.1)", border: "1px solid rgba(255, 185, 71, 0.3)", color: "#ffe7bc", marginBottom: "24px" }}>
              <FileText size={16} />
              <span style={{ fontWeight: "600" }}>Selected File: {file.name}</span>
            </div>
          )}

          <div className="form-group">
            <label>Add Your Skills (Frontend, Backend, Design...)</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="e.g. React"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill(e)}
              />
              <button type="button" onClick={addSkill} className="btn-secondary" style={{ padding: "10px 16px" }}>
                <Plus size={20} />
              </button>
            </div>

            <div className="skills-tags-container">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !file} className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
            {loading ? "Uploading resume..." : "Upload Resume & Save Skills"}
          </button>
        </form>
      </div>
    </div>
  );
}
