import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [astrologerId, setAstrologerId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [liveConsultations, setLiveConsultations] = useState([]);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        if (role) {
          const id = await AsyncStorage.getItem(
            role === "user" ? "userId" : "astrologerId"
          );
          setUserRole(role);
          if (role === "user") {
            setUserId(id);
          } else {
            setAstrologerId(id);
            await fetchProfile(id);
            await fetchLiveConsultations(id);
          }
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };

    fetchAuthData();
  }, []);

  const fetchProfile = async (id) => {
    try {
      const response = await axiosInstance.get(`/astrologers/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };

  const fetchLiveConsultations = async (id) => {
    try {
      const response = await axiosInstance.get(`/consultations/live`);
      setLiveConsultations(response.data);
    } catch (error) {
      console.error("Fetch live consultations error:", error);
    }
  };

  const setRole = async (role) => {
    try {
      await AsyncStorage.setItem("userRole", role);
      setUserRole(role);
    } catch (error) {
      console.error("Error setting role:", error);
    }
  };

  const setAuthData = async (role, response) => {
    if (!response || !response._id) {
      console.error("Cannot set auth data: ID is undefined");
      return;
    }

    const id = response._id;

    try {
      await AsyncStorage.setItem("userRole", role);
      if (role === "user") {
        await AsyncStorage.setItem("userId", id);
        setUserId(id);
      } else if (role === "astrologer") {
        await AsyncStorage.setItem("astrologerId", id);
        setAstrologerId(id);
      } else {
        console.error("Invalid role provided");
        return;
      }
      setRole(role);
    } catch (error) {
      console.error("Error setting auth data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        userId,
        astrologerId,
        profile,
        liveConsultations,
        setRole,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing AuthContext
const useAuth = () => useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };
