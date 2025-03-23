import { useState, useEffect, useRef } from "react";
import { api } from "../api";
import "../styles/ItemTransfer.css";

export default function ItemTransfer({ item }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getAllUsers();
        setUsers(response);
        setFilteredUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowDropdown(true);

    if (!value) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) =>
          user.username.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearch(user.username);
    setShowDropdown(false);
  };

  const handleTransfer = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setMessage("");

    try {
      await api.transferItem(item.id, selectedUser.id);
      setMessage(`Item successfully sent to ${selectedUser.username}!`);
    } catch (error) {
      setMessage("Failed to send item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="item-transfer">
      <h3>Send Item</h3>
      <div className="search-container" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={handleSearch}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && (
          <ul className="dropdown-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className={selectedUser?.id === user.id ? "selected" : ""}
                  onClick={() => handleSelectUser(user)}
                >
                  {user.username}
                </li>
              ))
            ) : (
              <li className="no-results">No users found</li>
            )}
          </ul>
        )}
      </div>

      <button className="transfer-button" onClick={handleTransfer} disabled={!selectedUser || loading}>
        {loading ? "Sending..." : "Send Item"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
