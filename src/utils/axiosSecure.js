import axios from "axios";
import Cookies from "js-cookie";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";


const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosSecure.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Token tampered or expired. Logging out...");
      await signOut(auth);
      Cookies.remove("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosSecure;


