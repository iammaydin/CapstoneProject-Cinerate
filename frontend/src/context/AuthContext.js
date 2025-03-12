import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  axios.defaults.baseURL = "http://localhost:5000";
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");

      try {
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const response = await axios.get("/api/auth/validate");

          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Authentication validation error:", err);

        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    if (!localStorage.getItem("token")) {
      setLoading(false);
    } else {
      checkAuthStatus();
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setError(null);

      return { success: true };
    } catch (error) {
      console.error(
        "Login error:",
        error.response ? error.response.data : error.message
      );
      setError(error.response?.data?.error || "Login failed");
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (fullName, username, email, password) => {
    try {
      const response = await axios.post("/api/auth/register", {
        fullName,
        username,
        email: email.toLowerCase().trim(),
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(null);
      setError(null);

      return { success: true };
    } catch (error) {
      console.error(
        "Register error:",
        error.response ? error.response.data : error.message
      );
      setError(error.response?.data?.error || "Registration failed");
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
