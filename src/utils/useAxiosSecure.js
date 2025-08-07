import React, { useEffect } from 'react';
import axiosSecure from "./axiosSecure";
const useAxiosSecure = () => {
  useEffect(() => {
    // You can put future side effects here if needed
  }, []);
    return axiosSecure;
};

export default useAxiosSecure;