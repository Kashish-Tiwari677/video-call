// frontend/src/contexts/AuthContext.jsx

import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext(null);

// axios instance
const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

// attach token automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ✅ REGISTER
  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      console.error("REGISTER ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ LOGIN
  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        setUserData(request.data.user); // optional
        navigate("/home");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ GET USER HISTORY
  const getHistoryOfUser = async () => {
    try {
      const request = await client.get("/get_all_activity");
      return request.data;
    } catch (err) {
      console.error("GET HISTORY ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ ADD TO HISTORY
  const addToUserHistory = async (meetingCode) => {
    try {
      const request = await client.post("/add_to_activity", {
        meeting_code: meetingCode,
      });
      return request.data;
    } catch (err) {
      console.error("ADD HISTORY ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
