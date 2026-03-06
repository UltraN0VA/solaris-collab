import { useEffect } from "react";
import { api } from "./services/api";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SolarisLandingPage from './pages/Auth/landingpage';
import LoginPage from './pages/Auth/loginpage';
import RegisterPage from './pages/Auth/registerpage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SolarisLandingPage/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;