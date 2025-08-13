// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import useAxiosHook from "../utils/useAxiosHook";
import { convertToBanglaDigits } from "../utils/convertNumber";

// helpers
const toBdt = (n, frac = 0) =>
    convertToBanglaDigits(
        Number(n || 0).toLocaleString(undefined, {
            minimumFractionDigits: frac,
            maximumFractionDigits: frac,
        })
    ) + "৳";

const monthKey = moment().format("MMM").toUpperCase(); // "JAN", "AUG", ...

// Auto-scroll list (vertical, seamless)
const AutoScrollList = ({ heightPx, items, renderRow, visibleCount = 4, speedSec = 30, rowClass = "h-11" }) => {
    const shouldAnimate = items.length > visibleCount;
    return (
        <div className="relative overflow-hidden" style={{ height: heightPx }}>
            <style>{`
        @keyframes scrollY {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
            <div
                className="w-full"
                style={{ animation: shouldAnimate ? `${speedSec}s linear infinite scrollY` : "none" }}
            >
                <ul className="divide-y divide-emerald-100">
                    {items.map((it, idx) => (
                        <li key={`a-${idx}`} className={`${rowClass} flex items-center`}>{renderRow(it, idx)}</li>
                    ))}
                </ul>
                {shouldAnimate && (
                    <ul className="divide-y divide-emerald-100" aria-hidden="true">
                        {items.map((it, idx) => (
                            <li key={`b-${idx}`} className={`${rowClass} flex items-center`}>{renderRow(it, idx)}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const Home = () => {

    const axiosPublic = useAxiosHook();

    // lists
    const [donations, setDonations] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // totals
    const [curDonTotal, setCurDonTotal] = useState(0);
    const [curExpTotal, setCurExpTotal] = useState(0);
    const [prevDonTotal, setPrevDonTotal] = useState(0);
    const [prevExpTotal, setPrevExpTotal] = useState(0);

    // payment
    const [payInfo, setPayInfo] = useState({
        bkash: "",
        nagad: "",
        bank: "",
        address: "",
    });

    // date ranges
    const startOfMonth = useMemo(() => moment().startOf("month").toDate(), []);
    const endOfMonth = useMemo(() => moment().endOf("month").toDate(), []);
    const epochStart = useMemo(() => new Date("1970-01-01T00:00:00Z"), []);
    const endOfPrevMonth = useMemo(() => moment().subtract(1, "month").endOf("month").toDate(), []);

    useEffect(() => {
        const LIST_LIMIT = 5;               // <— show only recent 30 in scrollers
        const LIST_SCOPE = "all";            // "all" = latest 30 overall; "month" = latest 30 of current month

        const fetchAll = async () => {
            try {
                // Build list params (for the scrollers only)
                const listParamsBase = { page: 1, limit: LIST_LIMIT };
                if (LIST_SCOPE === "month") {
                    listParamsBase.startDate = startOfMonth.toISOString();
                    listParamsBase.endDate = endOfMonth.toISOString();
                }

                // ---- LISTS: latest 30 only (no date filter if LIST_SCOPE === "all") ----
                const donListP = axiosPublic.get("/public/donationList", { params: listParamsBase });
                const expListP = axiosPublic.get("/public/expenseList", { params: listParamsBase });

                // ---- TOTALS: unchanged (current month + previous balance) ----
                const donCurP = axiosPublic.get("/public/donationList", {
                    params: {
                        startDate: startOfMonth.toISOString(),
                        endDate: endOfMonth.toISOString(),
                        page: 1,
                        limit: 1, // just need totals
                    },
                });

                const expCurP = axiosPublic.get("/public/expenseList", {
                    params: {
                        startDate: startOfMonth.toISOString(),
                        endDate: endOfMonth.toISOString(),
                        page: 1,
                        limit: 1,
                    },
                });

                const donPrevP = axiosPublic.get("/public/donationList", {
                    params: {
                        startDate: epochStart.toISOString(),
                        endDate: endOfPrevMonth.toISOString(),
                        page: 1,
                        limit: 1,
                    },
                });

                const expPrevP = axiosPublic.get("/public/expenseList", {
                    params: {
                        startDate: epochStart.toISOString(),
                        endDate: endOfPrevMonth.toISOString(),
                        page: 1,
                        limit: 1,
                    },
                });

                const payP = axiosPublic.get("/public/paymentInfo");

                const [
                    donList, expList,
                    donCur, expCur,
                    donPrev, expPrev,
                    payRes
                ] = await Promise.all([
                    donListP, expListP,
                    donCurP, expCurP,
                    donPrevP, expPrevP,
                    payP
                ]);

                // Set scroller lists (latest 30)
                setDonations(donList?.data?.data || []);
                setExpenses(expList?.data?.data || []);

                // Set totals (unchanged)
                setCurDonTotal(donCur?.data?.totalAmount || 0);
                setCurExpTotal(expCur?.data?.totalAmount || 0);
                setPrevDonTotal(donPrev?.data?.totalAmount || 0);
                setPrevExpTotal(expPrev?.data?.totalAmount || 0);

                // Payment
                if (payRes?.data) setPayInfo(payRes.data);
            } catch (err) {
                console.error("Home public fetch error:", err?.message || err);
            }
        };

        fetchAll();
    }, [axiosPublic, startOfMonth, endOfMonth, epochStart, endOfPrevMonth]);


    // balances
    const previousBalance = (prevDonTotal || 0) - (prevExpTotal || 0); // excluding current month
    const currentNet = (curDonTotal || 0) - (curExpTotal || 0);
    // Per your rule: মোট স্থিতি = পূর্বের স্থিতি - current মাসের স্থিতি
    const totalBalance = previousBalance - currentNet;

    // layout tuning for 1366×768:
    const rowHeight = 44; // tighter rows to fit payment bar
    const visibleRows = 4;

    return (
        <div className="h-full w-full bg-[#F4F6E8] flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-[1366px] mx-auto px-4 py-3 h-full flex flex-col overflow-hidden">
                {/* ===== Summary (compact) ===== */}
                <div className="rounded-2xl shadow-md border border-emerald-900/30 bg-white overflow-hidden">
                    <div className="bg-emerald-900 text-white px-4 py-2 flex items-center justify-between">
                        <h3 className="text-base md:text-lg font-bold">মসজিদের পূর্বের স্থিতিঃ</h3>
                        <div className="text-xl md:text-2xl font-extrabold">{toBdt(previousBalance)}</div>
                    </div>

                    {/* One line: আয় & ব্যয় */}
                    <div className="px-4 py-2 flex flex-wrap items-center justify-between text-emerald-900 gap-3">
                        <p className="text-lg font-bold">
                            {monthKey}-মাসের আয় <span className="text-emerald-700">{toBdt(curDonTotal)}</span>
                        </p>
                        <p className="text-lg font-bold">
                            {monthKey}-মাসের ব্যয় <span className="text-red-600">{toBdt(curExpTotal)}</span>
                        </p>
                    </div>

                    {/* মাসের স্থিতি + মোট স্থিতি */}
                    <div className="px-4 pb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="rounded-lg border border-emerald-900/20 bg-white">
                            <div className="text-center py-2">
                                <p className="text-sm font-semibold">{monthKey}-মাসের স্থিতি</p>
                                <p className="text-xl font-extrabold mt-1">{toBdt(currentNet)}</p>
                            </div>
                        </div>
                        <div className="rounded-lg border border-emerald-900/20 bg-white">
                            <div className="text-center py-2">
                                <p className="text-sm font-semibold">মোট স্থিতি</p>
                                <p className="text-xl font-extrabold mt-1">{toBdt(totalBalance)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== Two lists (compact, no extra list header) ===== */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden">
                    {/* Donation */}
                    <div className="rounded-2xl shadow-md border border-emerald-900/30 bg-white overflow-hidden flex flex-col">
                        {/* table header row */}
                        <div className="grid grid-cols-12 bg-emerald-100 text-emerald-900 font-semibold px-3 py-2 text-sm">
                            <div className="col-span-5">দান দাতাগণের নাম</div>
                            <div className="col-span-4 text-center">ঠিকানা</div>
                            <div className="col-span-3 text-right">সাদাকার পরিমান</div>
                        </div>
                        <div className="px-3 pb-2 flex-1 overflow-hidden">
                            <AutoScrollList
                                heightPx={visibleRows * rowHeight}
                                visibleCount={visibleRows}
                                speedSec={26}
                                rowClass="h-11"
                                items={donations}
                                renderRow={(it) => (
                                    <div className="grid grid-cols-12 w-full text-sm">
                                        <div className="col-span-5 truncate pr-2">{it.donorName}</div>
                                        <div className="col-span-4 text-center truncate px-2">{it.address}</div>
                                        <div className="col-span-3 text-right font-bold">{toBdt(it.amount)}</div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Expense */}
                    <div className="rounded-2xl shadow-md border border-emerald-900/30 bg-white overflow-hidden flex flex-col">
                        <div className="grid grid-cols-12 bg-emerald-100 text-emerald-900 font-semibold px-3 py-2 text-sm">
                            <div className="col-span-8">খরচের বিবরণ</div>
                            <div className="col-span-4 text-right">অর্থের পরিমান</div>
                        </div>
                        <div className="px-3 pb-2 flex-1 overflow-hidden">
                            <AutoScrollList
                                heightPx={visibleRows * rowHeight}
                                visibleCount={visibleRows}
                                speedSec={26}
                                rowClass="h-11"
                                items={expenses}
                                renderRow={(it) => (
                                    <div className="grid grid-cols-12 w-full text-sm">
                                        <div className="col-span-8 truncate pr-2">{it.expense}</div>
                                        <div className="col-span-4 text-right font-bold text-red-600">
                                            {toBdt(it.amount)}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* ===== Payment banner (bottom) ===== */}
                <div className="mt-3">
                    <h3 className="text-center text-xl md:text-2xl font-extrabold text-emerald-800">
                        আপনার সদাকা জমা করুন
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm md:text-base font-semibold">
                        {payInfo.bkash && <span className="text-pink-600">বিকাশ {payInfo.bkash}</span>}
                        {payInfo.nagad && <span className="text-red-600">নগদ {payInfo.nagad}</span>}
                        {payInfo.bank && <span className="text-emerald-700">{payInfo.bank}</span>}
                        {payInfo.address && <span className="text-gray-800">{payInfo.address}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
