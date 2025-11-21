import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 500 }}>
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={submit}>
        <label className="form-label">Email</label>
        <input
          className="form-control mb-2"
          name="email"
          value={form.email}
          onChange={change}
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control mb-3"
          name="password"
          value={form.password}
          onChange={change}
        />

        <button className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
