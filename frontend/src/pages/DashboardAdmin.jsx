import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function DashboardAdmin() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
}
