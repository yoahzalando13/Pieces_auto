import { Navigate } from "react-router-dom";
import useAuth from "../hooks/UseAuth";

export default function ProtectedRoute({ children }) {

    const { user, loading } = useAuth();
    const token = localStorage.getItem("token");

    if (loading) {
        return null;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}