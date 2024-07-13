import AsyncStorage from "@react-native-async-storage/async-storage";

const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
};

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    throw error;
  }
};

const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.error("Error removing token:", error);
    throw error;
  }
};

export { storeToken, getToken, removeToken };
