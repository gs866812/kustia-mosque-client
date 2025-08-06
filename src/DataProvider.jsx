import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import Cookies from "js-cookie";
import axios from 'axios';
import ContextData from './ContextData';




const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
    };
    // ******************************************************************************************************
    return <ContextData.Provider value={dataInfo}>{children}</ContextData.Provider>;
};

export default DataProvider;