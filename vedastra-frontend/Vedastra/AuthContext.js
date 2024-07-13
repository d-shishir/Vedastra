import React, { createContext, useState } from "react";
import { getToken, storeToken, removeToken } from "./utils/tokenStorage";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const login = async (tokenValue) => {
    await storeToken(tokenValue);
    setToken(tokenValue);
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
  };

  const checkAuthenticated = async () => {
    const storedToken = await getToken();
    setToken(storedToken);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        checkAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
