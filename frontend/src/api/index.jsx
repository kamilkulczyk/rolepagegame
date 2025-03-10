import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const API_URL = isDev ? "/fakeApi" : import.meta.env.VITE_API_URL;

const fakeApi = {
  login: async (email, password) => {
    return { token: "fake-jwt-token", user: { id: 1, email } };
  },
  register: async (username, email, password) => {
    return { token: "fake-jwt-token", user: { id: 1, username } };
  },
  getCharacter: async (userId) => {
    return { id: 1, name: "Hero", items: [] };
  },
  createCharacter: async (formData) => {
    return { id: 1, name: formData.name, items: [] };
  },
  createItem: async (characterId, itemName) => {
    const newItem = { id: Math.random(), name: itemName };
    let character = JSON.parse(localStorage.getItem("character"));
    character.items.push(newItem);
    localStorage.setItem("character", JSON.stringify(character));
    return newItem;
  },
};

const realApi = {
  login: async (email, password) => {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password: Array.from(passwordBytes),
      });
      return response.data;
  
    } catch (error) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
        };
      } else if (error.request) {
        throw {
          message: "No response from server.",
        };
      } else {
        throw {
          message: error.message,
        };
      }
    }
  },
  register: async (username, email, password) => {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
  
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password: Array.from(passwordBytes),
      });
      return response.data;
  
    } catch (error) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
        };
      } else if (error.request) {
        throw {
          message: "No response from server.",
        };
      } else {
        throw {
          message: error.message,
        };
      }
    }
  },
  getCharacter: async (userId) => {
    const res = await fetch(`${API_URL}/character/${userId}`);
    return res.json();
  },
  createItem: async (characterId, itemName) => {
    const res = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, name: itemName }),
    });
    return res.json();
  },
  createCharacter: async (formData) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.post(`${API_URL}/create-character`, formData, { headers });
      return response.json();
    } catch (error) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
        };
      } else if (error.request) {
        throw {
          message: "No response from server.",
        };
      } else {
        throw {
          message: error.message,
        }
      }
    }
  },
};

// Use fake API in development, real API in production
export const api = isDev ? fakeApi : realApi;