import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
})

export const GenerateCodeReview = async ({ code, language }) => {
    const response = await api.post("/api/review", { code, language });
    return response.data;
}