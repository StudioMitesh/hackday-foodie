import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const api = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axios.post(`${backendUrl}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getSession: async (sessionId: string) => {
    const response = await axios.get(`${backendUrl}/session/${sessionId}`);
    return response.data;
  },
};

