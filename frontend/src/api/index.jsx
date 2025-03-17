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
  getUserCharacters: async () => {
    return JSON.parse(localStorage.getItem("characters") || "[]");
  },
  getCharacterByID: async (id) => {
    const characters = JSON.parse(localStorage.getItem("characters") || "");
    const character = characters.find(char => char.id == id);
    return character;
  },
  getCharacters: async () => {
    return JSON.parse(localStorage.getItem("characters") || "[]");
  },  
  createCharacter: async (formData) => {
    const existingCharacters = JSON.parse(localStorage.getItem("characters")) || [];
    const newCharacter = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      user_id: 1,
      profile_picture: formData.profile_picture,
      profile_picture: formData.background_picture,
    };
    const updatedCharacters = [...existingCharacters, newCharacter];
    localStorage.setItem("characters", JSON.stringify(updatedCharacters));
    return;
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
  getUserCharacters: async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.get(`${API_URL}/user-characters`, { headers });
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
        }
      }
    }
  },
  getCharacterByID: async (characterID) => {
    try {
      const response = await axios.get(`${API_URL}/characters/${characterID}`);
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
        }
      }
    }
  },
  getCharacters: async () => {
    try {
      const response = await axios.get(`${API_URL}/characters`);
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
        }
      }
    }
  },
  createItem: async (characterId, itemName) => {
    const res = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, name: itemName }),
    });
    return res.json();
  },
  createCharacter: async (details, rpgData) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
        const charResponse = await axios.post(`${API_URL}/characters`, details, { headers });
        const characterID = charResponse.data.character_id;

        await axios.post(`${API_URL}/characters/${characterID}/rpg-data`, rpgData, { headers });

        return { message: "Character created successfully!" };
    } catch (error) {
        if (error.response) {
            throw { status: error.response.status, data: error.response.data };
        } else if (error.request) {
            throw { message: "No response from server." };
        } else {
            throw { message: error.message };
        }
    }
},

};

// Use fake API in development, real API in production
export const api = isDev ? fakeApi : realApi;