import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CharacterCreation from "./pages/CharacterCreation";
import ItemCreation from "./pages/ItemCreation";
import Register from "./pages/Register";

export default function App() {
  return (
    <AuthProvider>
      <Router>
      <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-character" element={<CharacterCreation />} />
          <Route path="/create-item" element={<ItemCreation />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}