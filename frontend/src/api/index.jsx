import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const API_URL = isDev ? "/fakeApi" : import.meta.env.VITE_API_URL;

let logoutCallback = null;

const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

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
  getRpgDataByCharacterID: async (id) => {
    const rpgData = JSON.parse(localStorage.getItem("rpgData") || "[]");
    return rpgData.find(data => data.character_id == id) || null;
  },
  getRpgDataByItemID: async (id) => {
    const rpgData = JSON.parse(localStorage.getItem("itemRpgData") || "[]");
    return rpgData.find(data => data.item_id == id) || null;
  },
  getCharacters: async () => {
    return JSON.parse(localStorage.getItem("characters") || "[]");
  },  
  createCharacter: async (characterDetails, rpgData) => {
    const existingCharacters = JSON.parse(localStorage.getItem("characters")) || [];
    const existingRpgData = JSON.parse(localStorage.getItem("rpgData")) || [];

    const newCharacter = {
        id: Date.now(),
        name: characterDetails.name,
        description: characterDetails.description,
        user_id: 1,
        profile_picture: characterDetails.profile_picture,
    };

    const updatedCharacters = [...existingCharacters, newCharacter];
    localStorage.setItem("characters", JSON.stringify(updatedCharacters));

    const newRpgData = {
        id: Date.now(),
        character_id: newCharacter.id,
        ...rpgData,
    };

    const updatedRpgData = [...existingRpgData, newRpgData];
    localStorage.setItem("rpgData", JSON.stringify(updatedRpgData));

    return { ...newCharacter, rpg_data: newRpgData };
  },
  updateCharacter: async (characterId, characterDetails, rpgData) => {
    const existingCharacters = JSON.parse(localStorage.getItem("characters")) || [];
    const existingRpgData = JSON.parse(localStorage.getItem("rpgData")) || [];

    const characterIndex = existingCharacters.findIndex(c => c.id === characterId);
    if (characterIndex === -1) {
        throw new Error("Character not found");
    }

    existingCharacters[characterIndex] = {
        ...existingCharacters[characterIndex],
        ...characterDetails,
    };
    localStorage.setItem("characters", JSON.stringify(existingCharacters));

    const rpgDataIndex = existingRpgData.findIndex(rpg => rpg.character_id === characterId);

    if (rpgDataIndex !== -1) {
        existingRpgData[rpgDataIndex] = {
            ...existingRpgData[rpgDataIndex],
            ...rpgData,
        };
    } else {
        const newRpgData = {
            id: Date.now(),
            character_id: characterId,
            ...rpgData,
        };
        existingRpgData.push(newRpgData);
    }

    localStorage.setItem("rpgData", JSON.stringify(existingRpgData));

    return {
        ...existingCharacters[characterIndex],
        rpg_data: existingRpgData.find(rpg => rpg.character_id === characterId) || null,
    };
  },
  createItem: async (itemDetails, itemRpgData) => {
    const existingItems = JSON.parse(localStorage.getItem("items")) || [];
    const existingItemRpgData = JSON.parse(localStorage.getItem("itemRpgData")) || [];

    const newItem = {
        id: Date.now(),
        name: itemDetails.name,
        description: itemDetails.description,
        user_id: 1,
        profile_image: itemDetails.profile_image,
    };

    const updatedItems = [...existingItems, newItem];
    localStorage.setItem("items", JSON.stringify(updatedItems));

    const newItemRpgData = {
        id: Date.now(),
        item_id: newItem.id,
        ...itemRpgData,
    };

    const updatedItemRpgData = [...existingItemRpgData, newItemRpgData];
    localStorage.setItem("itemRpgData", JSON.stringify(updatedItemRpgData));

    return { ...newItem, rpg_data: newItemRpgData };
  },
  getUserItems: async () => {
    return JSON.parse(localStorage.getItem("items") || "[]");
  },
  transferItem: async (itemId, receiverId) => {
    const existingItems = JSON.parse(localStorage.getItem("items")) || [];

    const itemIndex = existingItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
        throw { message: "Item not found" };
    }
    existingItems[itemIndex] = { 
        ...existingItems[itemIndex], 
        user_id: receiverId 
    };

    localStorage.setItem("items", JSON.stringify(existingItems));

    return { message: "Item successfully transferred", item: existingItems[itemIndex] };
  },
  getAllUsers: async () => {
    return JSON.parse(localStorage.getItem("users") || "[]");
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
        if (error.response.status === 401) {
          if (logoutCallback) logoutCallback();
        }
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
  getRpgDataByCharacterID: async (characterID) => {
    try {
      const response = await axios.get(`${API_URL}/characters/${characterID}/rpg-data`);
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
  createItem: async (details, rpgData) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
        const itemResponse = await axios.post(`${API_URL}/items`, details, { headers });
        const itemID = itemResponse.data.item_id;

        await axios.post(`${API_URL}/items/${itemID}/rpg-data`, rpgData, { headers });

        return { message: "Item created successfully!" };
    } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            if (logoutCallback) logoutCallback();
          }
          throw { status: error.response.status, data: error.response.data };
        } else if (error.request) {
          throw { message: "No response from server." };
        } else {
          throw { message: error.message };
        }
    }
  },
  getUserItems: async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.get(`${API_URL}/user-items`, { headers });
      return response.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          if (logoutCallback) logoutCallback();
        }
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
  getRpgDataByItemID: async (characterID) => {
    try {
      const response = await axios.get(`${API_URL}/items/${characterID}/rpg-data`);
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
          if (error.response.status === 401) {
            if (logoutCallback) logoutCallback();
          }
          throw { status: error.response.status, data: error.response.data };
        } else if (error.request) {
          throw { message: "No response from server." };
        } else {
          throw { message: error.message };
        }
    }
  },
  updateCharacter: async (characterID, details, rpgData) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
        await axios.put(`${API_URL}/characters/${characterID}`, details, { headers });
        await axios.put(`${API_URL}/characters/${characterID}/rpg-data`, rpgData, { headers });

        return { message: "Character updated successfully!" };
    } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            if (logoutCallback) logoutCallback();
          }
          throw { status: error.response.status, data: error.response.data };
        } else if (error.request) {
          throw { message: "No response from server." };
        } else {
          throw { message: error.message };
        }
    }
  },
  transferItem: async (itemId, receiverId) => {
    const token = localStorage.getItem("token");
    const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    try {
        await axios.put(`${API_URL}/items/${itemId}/transfer`, 
            { receiver_id: receiverId },
            { headers }
        );

        return { message: "Item sent successfully!" };
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
              if (logoutCallback) logoutCallback();
            }
            throw { status: error.response.status, data: error.response.data };
        } else if (error.request) {
            throw { message: "No response from server." };
        } else {
            throw { message: error.message };
        }
    }
  },
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
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
};

// Use fake API in development, real API in production
export const api = isDev ? fakeApi : realApi;