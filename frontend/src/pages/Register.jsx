import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 500 }}>
      <h2>Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label className="form-label">Name</label>
        <input
          className="form-control mb-2"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <label className="form-label">Email</label>
        <input
          className="form-control mb-2"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control mb-2"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <label className="form-label">Role</label>
        <select
          className="form-select mb-3"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>

        <button className="btn btn-primary w-100">Register</button>
      </form>
    </div>
  );
}
