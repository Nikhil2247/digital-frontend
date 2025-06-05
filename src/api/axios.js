import axios from "axios";

const API = axios.create({
  baseURL: 'https://backend.omnicassion.com', // your NestJS base
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;