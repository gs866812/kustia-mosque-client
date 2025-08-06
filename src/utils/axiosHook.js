import axios from 'axios';

const axiosHook = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

const useAxiosHook = () => {
    return axiosHook;
};

export default useAxiosHook;

