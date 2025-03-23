import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { setLogoutCallback } from "./api/index";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CharacterCreation from "./pages/CharacterCreation";
import ItemCreation from "./pages/ItemCreation";
import Register from "./pages/Register";
import Profile from "./pages/Profile"
import Character from "./pages/Character";
import Item from "./pages/Item";

export default function App() {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  return (
    <AuthProvider>
      <Router>
      <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-character" element={<CharacterCreation />} />
          <Route path="/edit-character/:id" element={<CharacterCreation />} />
          <Route path="/create-item" element={<ItemCreation />} />
          <Route path="/characters/:id" element={<Character />} />
          <Route path="/items/:id" element={<Item />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}