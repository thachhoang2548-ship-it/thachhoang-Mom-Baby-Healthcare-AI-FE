/**
 * [MODEL] Diet Service - Chế độ ăn uống
 * Backend: .NET
 */
import axiosClient from "../api/axiosClient";

const dietService = {
  fetchDiet: async () => {
    const res = await axiosClient.get("/api/diet");
    return res.data;
  },
  generateDiet: async (preferences) => {
    const res = await axiosClient.post("/api/diet/generate", preferences);
    return res.data;
  },
};

export default dietService;
