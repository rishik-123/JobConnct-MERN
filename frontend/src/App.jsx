import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "./context/AuthContext.jsx";

// Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Network from "./pages/Network.jsx";
import UploadResume from "./pages/UploadResume.jsx";
import Achievements from "./pages/Achievements.jsx";
import Hackathons from "./pages/Hackathons.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Route protection component
function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Checking session...</p>;
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading, token } = useContext(AuthContext);
  if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Checking admin role...</p>;
  return token && user && user.role === "admin" ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/network" element={<Network />} />
          <Route path="/upload-resume" element={<UploadResume />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/hackathons" element={<Hackathons />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
