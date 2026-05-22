import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import * as authApi from "../api/auth";
import type { LoginFormData } from "../types/index";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    try {
      setServerError(null);
      const result = await authApi.login(data);
      login(result);
      navigate("/dashboard");
    } catch {
      setServerError("Invalid email or password");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>💰 Expense Tracker</h1>
        <h2 style={styles.subtitle}>Sign in</h2>

        {serverError && <div style={styles.alert}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input {...register("email")} type="email" style={styles.input} />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input {...register("password")} type="password" style={styles.input} />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
  },
  title: { textAlign: "center", margin: "0 0 0.25rem", fontSize: "1.5rem" },
  subtitle: { textAlign: "center", margin: "0 0 1.5rem", fontWeight: 400, color: "#6b7280" },
  alert: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "0.85rem", fontWeight: 500 },
  input: {
    padding: "0.6rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
  },
  error: { fontSize: "0.8rem", color: "#dc2626" },
  button: {
    padding: "0.7rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: "0.5rem",
  },
  footer: { textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#6b7280" },
  link: { color: "#4f46e5", textDecoration: "none", fontWeight: 500 },
};
