import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env'

// IMPORTANTE: LEER README.md
const API_URL = API_URL


export const api = {
  get: async (endpoint) => {
    const token = await AsyncStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      return await response.json();

    } catch (error) {
      console.error("Error en GET:", error);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    const token = await AsyncStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      return await response.json();

    } catch (error) {
      console.error("Error en POST:", error);
      throw error;
    }
  }
};