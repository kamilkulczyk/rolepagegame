import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const API_URL = isDev ? "/fakeApi" : import.meta.env.VITE_API_URL;
const WS_URL = API_URL.replace(/^http/, "ws");

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

const fakeApi = {
  login: async (email, password) => {
    return { token: "fake-jwt-token", user: { id: 1, email } };
  },
  register: async (username, email, password) => {
    return { token: "fake-jwt-token", user: { id: 1, username } };
  },
  getUserCharacters: async (id = null) => {
    if(!id) id = 1;
    const characters = JSON.parse(localStorage.getItem("characters") || "");
    const userCharacters = characters.filter(char => char.user_id == id);
    return userCharacters;
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
  getUserItems: async (id = null) => {
    if(!id) id = 1;
    const items = JSON.parse(localStorage.getItem("items") || "");
    const userItems = items.filter(char => char.user_id == id);
    return userItems;
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
  getUserByID: async (userId) => {
    const users = JSON.parse(localStorage.getItem("users") || "");
    const user = users.find(char => char.id == userId);
    return user;
  },
  getMessages: async (userId) => {
    const messages = JSON.parse(localStorage.getItem("messages") || "");
    const userMessages = messages.filter(char => char.recipientId == userId);
    return userMessages;
  },
  sendMessage: async (_, recipientId, message) => {
    const messages = JSON.parse(localStorage.getItem("messages")) || [];

    const newMessage = {
      senderId : 1,
      recipientId,
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    return newMessage;
  },
  createWebSocket: (userId, onMessageReceived) => {
    console.log(`🟢 [FAKE WS] Connected to chat for user ${userId}`);

    const interval = setInterval(() => {
      const messages = JSON.parse(localStorage.getItem("messages")) || {};
      const newMessages = messages[userId] || [];

      if (newMessages.length > 0) {
        onMessageReceived(newMessages[newMessages.length - 1]);
      }
    }, 2000);

    return {
      send: (messageObj) => {
        console.log("📩 [FAKE WS] Sent message:", messageObj);
        api.sendMessage(messageObj.recipient_id, messageObj.message);
      },
      close: () => {
        console.log(`🔴 [FAKE WS] Disconnected from user ${userId}`);
        clearInterval(interval);
      },
    };
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
  getUserCharacters: async (id = null) => {
    if (!id) {
      const storedUser = localStorage.getItem("user");
      
      if (!storedUser) throw new Error("User ID is required but not found in local storage.");

      try {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser?.id) throw new Error("Invalid user data in local storage.");
          id = parsedUser.id;
      } catch (error) {
          throw new Error("Failed to parse user data from local storage.");
      }
    }

    try {
        const response = await axios.get(`${API_URL}/user-characters/${id}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401 && logoutCallback) logoutCallback();
            throw { status: error.response.status, data: error.response.data };
        } else if (error.request) {
            throw { message: "No response from server." };
        } else {
            throw { message: error.message };
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
  getUserItems: async (id = null) => {
    if (!id) {
      const storedUser = localStorage.getItem("user");
      
      if (!storedUser) throw new Error("User ID is required but not found in local storage.");

      try {
          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser?.id) throw new Error("Invalid user data in local storage.");
          id = parsedUser.id;
      } catch (error) {
          throw new Error("Failed to parse user data from local storage.");
      }
    }
    
    try {
      const response = await axios.get(`${API_URL}/user-items/${id}`);
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
  getUserByID: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
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
  getMessages: async (userId) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
        const response = await axios.get(`${API_URL}/messages/${userId}`, { headers });
        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn("Server returned non-array response:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
  },
  createWebSocket: async (onMessageReceived) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    if (!token) {
      console.error("❌ No JWT token found in localStorage");
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/connect-ws`, { headers });
      console.log("response", response)
      if (!response.ok) {
        console.error("❌ Failed to get WebSocket connection details");
        return null;
      }

      const data = await response.json();
      const socket = new WebSocket(`${WS_URL}/ws?user_id=${data.userID}&connection_id=${data.connectionID}`);

      socket.onopen = () => console.log("✅ WebSocket connected");

      socket.onmessage = (event) => {
        try {
          const receivedMessage = JSON.parse(event.data);
          onMessageReceived(receivedMessage);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => console.error("❌ WebSocket error:", error);
      socket.onclose = () => console.log("❌ WebSocket closed");

      return socket;
    } catch (error) {
      if (error.response) {
          console.error("❌ Error creating WebSocket:", error.response.status, error.response.data);
      } else if (error.request) {
          console.error("❌ Error creating WebSocket: No response received");
      } else {
          console.error("❌ Error creating WebSocket:", error.message);
      }
      return null;
    }
  },
  sendMessage: (socket, recipientId, message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ recipient_id: recipientId, message }));
    } else {
      console.error("WebSocket is not open!");
    }
  },
};

// Use fake API in development, real API in production
export const api = isDev ? fakeApi : realApi;