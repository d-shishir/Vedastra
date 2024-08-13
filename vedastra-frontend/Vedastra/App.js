import React from "react";
import MainNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainNavigator />
      </SocketProvider>
    </AuthProvider>
  );
}
