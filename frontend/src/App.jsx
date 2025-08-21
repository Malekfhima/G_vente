import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.jsx";
import AppRoutes from "./AppRoutes";
import Navbar from "./components/Navbar";
import "./index.css";

const AppLayout = () => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";
  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;
