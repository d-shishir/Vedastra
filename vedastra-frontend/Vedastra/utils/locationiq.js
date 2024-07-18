// utils/locationiq.js
import axios from "axios";

const LOCATIONIQ_URL = "https://us1.locationiq.com/v1/search.php";
const API_KEY = "pk.6410038a1f2789847bcc248ccf843f24"; // Replace with your LocationIQ API key

export const searchLocation = async (query) => {
  try {
    const response = await axios.get(LOCATIONIQ_URL, {
      params: {
        key: API_KEY,
        q: query,
        format: "json",
        limit: 5,
      },
    });
    return response.data.map((result) => ({
      place_id: result.place_id,
      display_name: result.display_name,
      lat: result.lat,
      lon: result.lon,
    }));
  } catch (error) {
    console.error("Error fetching location data:", error);
    throw error;
  }
};
