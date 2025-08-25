import React, { useContext, useEffect, useState } from "react";
import useAxiosSecure from "../../utils/useAxiosSecure";
import ContextData from "../../ContextData";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

/** Reusable section component for any meta "kind" */
const MetaSection = ({ title, kind }) => {
    const { user, refetch, setRefetch } = useContext(ContextData);
    const axiosSecure = useAxiosSecure();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    const [addOpen, setAddOpen] = useState(false);
    const [newValue, setNewValue] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [editValue, setEditValue] = useState("");

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // fetch data
    useEffect(() => {
        if (!user?.email) return;
        (async () => {
            try {
                const res = await axiosSecure.get("/meta", {
                    params: {
                        email: user.email,
                        kind,
                        search: debouncedSearch,
                        page: currentPage,
                        limit: itemsPerPage,
                    },
                });
                setRows(res?.data?.data || []);
                setTotalCount(res?.data?.totalCount || 0);
            } catch (err) {
                console.error(err);
                toast.error("ডাটা আনতে সমস্যা হয়েছে");
            }
        })();
    }, [axiosSecure, user?.email, kind, debouncedSearch, currentPage, itemsPerPage, refetch]);

    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    const noResults = totalCount === 0;

    const renderPagination = () => {
        if (noResults) return null;
        const btns = [];
        const maxButtons = 5;

        btns.push(
            <button
                key="prev"
                className="btn btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
                Prev
            </button>
        );

        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        if (startPage > 1) {
            btns.push(
                <button
                    key={1}
                    className={`btn btn-sm ${currentPage === 1 ? "localBG text-white" : ""}`}
                    onClick={() => setCurrentPage(1)}
                >
                    1
                </button>
            );
            if (startPage > 2) btns.push(<span key="dots-start" className="px-2">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            btns.push(
                <button
                    key={i}
                    className={`btn btn-sm ${currentPage === i ? "localBG text-white" : ""}`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) btns.push(<span key="dots-end" className="px-2">...</span>);
            btns.push(
                <button
                    key={totalPages}
                    className={`btn btn-sm ${currentPage === totalPages ? "localBG text-white" : ""}`}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        btns.push(
            <button
                key="next"
                className="btn btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
                Next
            </button>
        );

        return btns;
    };

    // add
    const onAddSubmit = async (e) => {
        e.preventDefault();
        const val = (newValue || "").trim();
        if (!val) return toast.error("মান লিখুন");

        try {
            const res = await axiosSecure.post(
                "/meta",
                { kind, value: val },
                { params: { email: user.email } }
            );
            if (res?.data?.insertedId) {
                toast.success("যুক্ত হয়েছে!");
                setNewValue("");
                setAddOpen(false);
                setCurrentPage(1);
                setRefetch(p => !p);
            } else {
                toast.error(res?.data?.message || "যুক্ত করা যায়নি");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "যুক্ত করতে সমস্যা হয়েছে");
        }
    };

    // edit
    const openEdit = (row) => {
        setEditRow(row);
        setEditValue(row.value || "");
        setEditOpen(true);
    };
    const onEditSubmit = async (e) => {
        e.preventDefault();
        const val = (editValue || "").trim();
        if (!val) return toast.error("মান লিখুন");
        try {
            const res = await axiosSecure.put(
                `/meta/${editRow._id}`,
                { kind, value: val },
                { params: { email: user.email } }
            );
            if (res?.data?.modifiedCount > 0 || res?.data?.updated) {
                toast.success("আপডেট হয়েছে!");
                setEditOpen(false);
                setEditRow(null);
                setRefetch(p => !p);
            } else {
                toast.error("কোনো পরিবর্তন নেই");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "আপডেট করতে সমস্যা হয়েছে");
        }
    };

    // delete
    const onDelete = (row) => {
        Swal.fire({
            title: "তুমি কি নিশ্চিত?",
            text: "আপনি এটা আর ফিরিয়ে আনতে পারবে না!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.delete(`/meta/${row._id}`, {
                    params: { email: user.email, kind },
                });
                if (res?.data?.deletedCount > 0) {
                    toast.success("মুছে ফেলা হয়েছে!");
                    setRefetch(p => !p);
                } else {
                    toast.error(res?.data?.message || "ডিলিট করা যায়নি");
                }
            } catch (err) {
                toast.error(err?.response?.data?.message || "ডিলিট করতে সমস্যা হয়েছে");
            }
        });
    };

    return (
        <section className="mb-10">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold">{title}</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="খুঁজুন..."
                        className="input input-bordered"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                    <button className="btn localBG text-white" onClick={() => setAddOpen(true)}>
                        নতুন যোগ করুন
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr className="bg-gray-200 text-center">
                            <th>#</th>
                            <th>মান</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-500">কোনো তথ্য পাওয়া যায়নি</td>
                            </tr>
                        ) : rows.map((r, idx) => (
                            <tr key={r._id} className="text-center hover:bg-gray-100">
                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                <td>{r.value}</td>
                                <td className="space-x-1">
                                    <button className="btn btn-sm bg-yellow-500" onClick={() => openEdit(r)}>
                                        <FaRegEdit />
                                    </button>
                                    <button className="btn btn-sm bg-red-500 text-white" onClick={() => onDelete(r)}>
                                        <MdDeleteForever />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex gap-1">{renderPagination()}</div>
                <select
                    className="border border-gray-300 rounded-md py-1"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>

            {/* Add Modal */}
            {addOpen && (
                <dialog open className="modal">
                    <div className="modal-box px-8">
                        <button
                            className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2"
                            onClick={() => setAddOpen(false)}
                        >
                            ✕
                        </button>
                        <h4 className="font-bold text-lg mb-2">নতুন যোগ করুন</h4>
                        <form onSubmit={onAddSubmit} className="space-y-3">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="মান লিখুন"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                autoFocus
                                required
                            />
                            <div className="flex justify-end">
                                <button className="btn localBG text-white">সেভ</button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}

            {/* Edit Modal */}
            {editOpen && (
                <dialog open className="modal">
                    <div className="modal-box px-8">
                        <button
                            className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2"
                            onClick={() => setEditOpen(false)}
                        >
                            ✕
                        </button>
                        <h4 className="font-bold text-lg mb-2">সম্পাদনা</h4>
                        <form onSubmit={onEditSubmit} className="space-y-3">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="নতুন মান লিখুন"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                                required
                            />
                            <div className="flex justify-end">
                                <button className="btn localBG text-white">আপডেট</button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}
        </section>
    );
};

const LookupManager = () => {
    return (
        <div className="px-5 mt-5">
            <h2 className="text-2xl font-semibold mb-6">তালিকা ব্যবস্থাপনা (সব এক পেজে)</h2>

            {/* Section-1: addressCollections */}
            <MetaSection title="Section-1: ঠিকানা (Address)" kind="addresses" />

            {/* Section-2: incomeCategoriesCollections */}
            <MetaSection title="Section-2: আয়ের ক্যাটাগরি (Donations)" kind="incomeCategories" />

            {/* Section-3: expenseCategoriesCollections */}
            <MetaSection title="Section-3: খরচের ক্যাটাগরি (Expenses)" kind="expenseCategories" />

            {/* Section-4: unitCollections */}
            <MetaSection title="Section-4: ইউনিট (Donations)" kind="units" />

            {/* Section-5: expenseUnitCollections */}
            <MetaSection title="Section-5: ইউনিট (Expenses)" kind="expenseUnits" />

            {/* Section-6: referenceCollections */}
            <MetaSection title="Section-6: রেফারেন্স (Donations)" kind="references" />

            {/* Section-7: expenseReferenceCollections */}
            <MetaSection title="Section-7: রেফারেন্স (Expenses)" kind="expenseReferences" />
        </div>
    );
};


export default LookupManager;
