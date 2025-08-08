import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import Cookies from "js-cookie";
import axios from 'axios';
import ContextData from './ContextData';
import useAxiosSecure from './utils/useAxiosSecure';
import toast from 'react-hot-toast';




const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refetch, setRefetch] = useState(false);
    const [address, setAddress] = useState([]);
    const [category, setCategory] = useState([]);
    const [unit, setUnit] = useState([]);
    const [reference, setReference] = useState([]);

    const [expenseUnit, setExpenseUnit] = useState([]);
    const [expenseCategory, setExpenseCategory] = useState([]);
    const [expenseReference, setExpenseReference] = useState([]);

    const axiosSecure = useAxiosSecure();

    // ******************************************************************************************************
    // ******************************************************************************************************
    useEffect(() => {
        const fetchAddressCategoriesUnitReference = async () => {
            if (!user?.email) return; // prevent running with undefined email

            try {
                const res = await axiosSecure.get(`/getInfo?email=${user.email}`);
                const info = res?.data;
                if (info) {
                    setAddress(info.address || []);
                    setCategory(info.incomeCategories || []);
                    setUnit(info.unit || []);
                    setReference(info.reference || []);
                    setExpenseCategory(info.expenseCategory || []);
                    setExpenseUnit(info.expenseUnit || []);
                    setExpenseReference(info.expenseReference || []);
                }
            } catch (err) {
                console.error(err);
                toast.error("Data not found or error fetching");
            }
        };

        fetchAddressCategoriesUnitReference();
    }, [user?.email, refetch, axiosSecure]);


    // ******************************************************************************************************
    // Setup auth state tracking
    useEffect(() => {
        let refreshTimer;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const email = currentUser.email;
                setUser(currentUser);

                // 🔑 Request initial token
                await axios.post(`${import.meta.env.VITE_API_URL}/jwt`, { email }, { withCredentials: true });

                // 🕒 Refresh every 50 mins
                refreshTimer = setInterval(async () => {
                    try {
                        await axios.post(`${import.meta.env.VITE_API_URL}/jwt`, { email }, { withCredentials: true });
                        console.log("🔁 JWT refreshed");
                    } catch (err) {
                        console.error("Token refresh failed:", err);
                        handleLogout();
                    }
                }, 50 * 60 * 1000); // 50 mins
            } else {
                setUser(null);
                Cookies.remove("authToken");
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
            clearInterval(refreshTimer);
        };
    }, []);

    // * ******************************************************************************************************
    const handleLogout = async () => {
        try {
            await signOut(auth); // 🔒 logout from Firebase
            await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {}, { withCredentials: true }); // ❌ clear cookie
            Cookies.remove("authToken"); // ✅ just in case
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };


    // ******************************************************************************************************

    const dataInfo = {
        user,
        loading,
        handleLogout,
        refetch,
        setRefetch,
        address,
        category,
        unit,
        reference,
        expenseUnit,
        expenseCategory,
        expenseReference,
    };
    // ******************************************************************************************************
    return <ContextData.Provider value={dataInfo}>{children}</ContextData.Provider>;
};

export default DataProvider;