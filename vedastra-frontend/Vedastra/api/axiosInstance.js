import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosInstance = axios.create({
  baseURL: "http://192.168.1.64:5000/api", // Replace with your API base URL
  timeout: 5000, // Timeout after 5 seconds
});

// Request interceptor to add the token to headers before each request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration or unauthorized access
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await AsyncStorage.removeItem("token");
      // Redirect to login or handle as needed
      // Example: NavigationService.navigate('Login');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
