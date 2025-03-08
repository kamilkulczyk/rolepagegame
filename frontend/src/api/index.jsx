const isDev = import.meta.env.MODE === "development";
const API_URL = isDev ? "/fakeApi" : "https://your-real-api.com";

const fakeApi = {
  login: async (username, password) => {
    return { token: "fake-jwt-token", user: { id: 1, username } };
  },
  getCharacter: async (userId) => {
    return { id: 1, name: "Hero", items: [] };
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
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
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
  createCharacter: async (name) => {
    const res = await fetch(`${API_URL}/character`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },
};

// Use fake API in development, real API in production
export const api = isDev ? fakeApi : realApi;