import { Routes, Route } from "react-router-dom";
import Home from "./pages/others/home/pages/Home";
import Login from "./pages/authentication/login/Login";

import SignUp from "./pages/authentication/signup/SignUp";

import RegistrationSuccess from "./pages/authentication/registration-success/RegistrationSuccess";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      {/* Add more routes as you build them */}
    </Routes>
  );
};

export default App;
