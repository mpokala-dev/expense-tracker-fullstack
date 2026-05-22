import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

// Navbar reads auth state to show the correct actions.
// Logout clears state via the context and redirects to login.
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>
        💰 Expense Tracker
      </Link>
      <div style={styles.right}>
        <span style={styles.greeting}>Hi, {user?.name}</span>
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "#1a1a2e",
    color: "#fff",
  },
  brand: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "1.2rem",
    fontWeight: 600,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  greeting: {
    fontSize: "0.9rem",
    opacity: 0.8,
  },
  button: {
    padding: "0.4rem 1rem",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
  },
};
