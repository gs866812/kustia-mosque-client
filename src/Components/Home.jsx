// src/pages/Home.jsx (or wherever you keep it)
import React from "react";
import { convertToBanglaDigits } from "../utils/convertNumber";


const Home = () => {
    // ---- Demo data (replace with backend later) ----
    const monthKey = "JAN";
    const summary = {
        previousBalance: 250350,
        income: 250350,
        expense: 250350,
        net: 250350,
    };

    const donors = [
        { name: "মোঃ আল আমিন", address: "কুষ্টিয়া", sadaqah: 2000, expenseDetail: "ফ্যান ১০ পিস", due: 3000 },
        { name: "রুমজান", address: "আমেরিকান, প্রবাসী", sadaqah: 5008, expenseDetail: "মিশন খরচ", due: 2000 },
        { name: "রবেল আলি", address: "সৌদি প্রবাসী", sadaqah: 9008, expenseDetail: "ওয়্যার ধারা টাইলস", due: 4000 },
        { name: "রিপন", address: "চিথলিয়া", sadaqah: 7008, expenseDetail: "ইমাম সাহেবের বেতন", due: 15000 },
        { name: "হাবিবুর রহমান", address: "রাজশাহী", sadaqah: 9008, expenseDetail: "কারেন্ট বিল", due: 2000 },
    ];

    const payInfo = {
        title: "আপনার সদাকা জমা করুন",
        bkash: "০১৩০০০০০০০০",
        nagad: "০১৩০০০০০০০০",
        bank: "Islami Bank: 205000024840913",
        address: "চিথলিয়া কেন্দ্রীয় জামে মসজিদ, শাকার, কুষ্টিয়া",
    };

    // ---- helpers ----
    const bdt = (n) =>
        `${convertToBanglaDigits(
            Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })
        )}`;

    return (
        <div className="min-h-screen bg-[#F4F6E8]">
            <div className="max-w-6xl mx-auto px-4 py-2">
                {/* ===== Top Summary Card ===== */}
                <div className="rounded-2xl shadow-lg bg-white border border-emerald-900/30 overflow-hidden">
                    <div className="bg-emerald-900 text-white px-[20%]  flex items-center justify-between py-1">
                        <h3 className="font-bold">মসজিদের পূর্বের হিসাবঃ</h3>
                        <div className="font-bold">{bdt(summary.previousBalance)}</div>
                    </div>
                    <section className=" flex border w-[80%] mx-auto py-1 my-1">
                        <div className="w-1/2">
                            <h3 className="">মসজিদের পূর্বের হিসাবঃ {bdt(summary.previousBalance)}</h3>
                        </div>
                        <div className="w-1/2"></div>
                    </section>
                </div>

                {/* ===== Donor Table ===== */}
                <div className="mt-2 rounded-2xl shadow-lg bg-white border border-emerald-900/30 overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr className="bg-emerald-800 text-white px-6 text-lg font-semibold rounded-t-2xl">
                                    <th>দান দাতাগণের নাম</th>
                                    <th>ঠিকানা</th>
                                    <th>সাদাকার পরিমান</th>
                                    <th>খরচের বিবরণ</th>
                                    <th>ঋণের পরিমান</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {donors.map((d, i) => (
                                    <tr key={i} className="hover:bg-emerald-50">
                                        <td className="text-left">{d.name}</td>
                                        <td>{d.address}</td>
                                        <td className="font-bold">{bdt(d.sadaqah)}</td>
                                        <td className="text-left">{d.expenseDetail}</td>
                                        <td className="font-bold text-red-600">{bdt(d.due)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===== Donate Bar ===== */}
                <div className="mt-10">
                    <h3 className="text-center text-xl md:text-2xl font-extrabold text-emerald-800">
                        {payInfo.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm md:text-base font-semibold">
                        <span className="text-pink-600">বিকাশ {payInfo.bkash}</span>
                        <span className="text-red-600">নগদ {payInfo.nagad}</span>
                        <span className="text-emerald-700">{payInfo.bank}</span>
                        <span className="text-gray-700">{payInfo.address}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
