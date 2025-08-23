import React, { useContext, useEffect, useState } from 'react';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { convertToBanglaDigits } from '../../utils/convertNumber';
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import ContextData from '../../ContextData';

const DonorList = () => {
    const { user, refetch, setRefetch } = useContext(ContextData);
    const axiosSecure = useAxiosSecure();

    const [donors, setDonors] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalDonateAmount, setTotalDonateAmount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const [addOpen, setAddOpen] = useState(false);
    const [newDonor, setNewDonor] = useState({
        donorName: "",
        donorAddress: "",
        donorContact: ""
    });

    const [editOpen, setEditOpen] = useState(false);
    const [editDonor, setEditDonor] = useState(null);
    const [editFields, setEditFields] = useState({
        donorName: "",
        donorAddress: "",
        donorContact: ""
    });

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // fetch donor list
    useEffect(() => {
        if (!user?.email) return;
        const fetchDonors = async () => {
            try {
                const res = await axiosSecure.get('/donorList', {
                    params: {
                        email: user.email,
                        search: debouncedSearch,
                        page: currentPage,
                        limit: itemsPerPage
                    }
                });
                if (res?.data) {
                    setDonors(res.data.data || []);
                    setTotalCount(res.data.totalCount || 0);
                    setTotalDonateAmount(res.data.totalDonateAmount || 0);
                }
            } catch (err) {
                console.error(err);
                toast.error("Donor list আনতে সমস্যা হয়েছে।");
            }
        };
        fetchDonors();
    }, [axiosSecure, user?.email, debouncedSearch, currentPage, itemsPerPage, refetch]);

    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    const noResults = totalCount === 0;

    const renderPagination = () => {
        if (noResults) return null;
        const pages = [];
        const maxButtons = 5;

        pages.push(
            <button key="prev" className="btn btn-sm" disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
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
            pages.push(
                <button key={1} className={`btn btn-sm ${currentPage === 1 ? 'localBG text-white' : ''}`}
                    onClick={() => setCurrentPage(1)}>1</button>
            );
            if (startPage > 2) pages.push(<span key="dots-start" className="px-2">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button key={i}
                    className={`btn btn-sm ${currentPage === i ? 'localBG text-white' : ''}`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push(<span key="dots-end" className="px-2">...</span>);
            pages.push(
                <button key={totalPages}
                    className={`btn btn-sm ${currentPage === totalPages ? 'localBG text-white' : ''}`}
                    onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                </button>
            );
        }

        pages.push(
            <button key="next" className="btn btn-sm" disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                Next
            </button>
        );

        return pages;
    };

    // add
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!user?.email) return;
        try {
            const payload = {
                donorName: newDonor.donorName?.trim(),
                donorAddress: newDonor.donorAddress?.trim(),
                donorContact: newDonor.donorContact?.trim()
            };
            const res = await axiosSecure.post('/addDonor', payload, { params: { email: user.email } });
            if (res?.data?.insertedId) {
                toast.success("নতুন দাতা যুক্ত হয়েছে!");
                setNewDonor({ donorName: "", donorAddress: "", donorContact: "" });
                setAddOpen(false);
                setRefetch(prev => !prev);
            } else {
                toast.error(res?.data?.message || "দাতা যুক্ত করা যায়নি");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "দাতা যুক্ত করতে সমস্যা হয়েছে।");
        }
    };

    // edit open
    const openEdit = (d) => {
        setEditDonor(d);
        setEditFields({
            donorName: d?.donorName || "",
            donorAddress: d?.donorAddress || "",
            donorContact: d?.donorContact || ""
        });
        setEditOpen(true);
    };

    // edit submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!user?.email || !editDonor?._id) return;
        try {
            const payload = {
                donorName: editFields.donorName?.trim(),
                donorAddress: editFields.donorAddress?.trim(),
                donorContact: editFields.donorContact?.trim(),
            };
            const res = await axiosSecure.put(`/updateDonor/${editDonor._id}`, payload, { params: { email: user.email } });
            if (res?.data?.modifiedCount > 0) {
                toast.success("দাতার তথ্য আপডেট হয়েছে!");
                setEditOpen(false);
                setEditDonor(null);
                setRefetch(prev => !prev);
            } else {
                toast.error("কোনো পরিবর্তন করা হয়নি।");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "আপডেট করতে সমস্যা হয়েছে।");
        }
    };

    // delete
    const handleDelete = (id) => {
        Swal.fire({
            title: "তুমি কি নিশ্চিত?",
            text: "আপনি এটা আর ফিরিয়ে আনতে পারবে না!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axiosSecure.delete(`/deleteDonor/${id}`, { params: { email: user.email } });
                    if (res?.data?.deletedCount > 0) {
                        toast.success("দাতা মুছে ফেলা হয়েছে!");
                        setRefetch(prev => !prev);
                    } else {
                        toast.error(res?.data?.message || "দাতা ডিলিট করা যায়নি।");
                    }
                } catch (err) {
                    toast.error(err?.response?.data?.message || "দাতা ডিলিট করতে সমস্যা হয়েছে।");
                }
            }
        });
    };

    return (
        <div className='px-5 mt-5'>
            {/* Header */}
            <section className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-semibold'>দাতার তালিকা</h2>
                <div className='flex items-center gap-2'>
                    <input
                        type="text"
                        placeholder="Search donor..."
                        className="input input-bordered"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                    <button className='btn localBG text-white' onClick={() => setAddOpen(true)}>Add New</button>
                </div>
            </section>

            {/* Table */}
            <section>
                <div className="overflow-x-auto my-5">
                    <table className="table table-zebra">
                        <thead>
                            <tr className='bg-gray-200 text-center'>
                                <th>Donor ID</th>
                                <th>নাম</th>
                                <th>ঠিকানা</th>
                                <th>যোগাযোগ</th>
                                <th>মোট অনুদান</th>
                                <th>অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody>
                            {noResults ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">কোনো তথ্য পাওয়া যায়নি</td>
                                </tr>
                            ) : donors.map(d => (
                                <tr key={d._id} className="text-center hover:bg-gray-100">
                                    <td>{convertToBanglaDigits(d.donorId ?? "")}</td>
                                    <td>{d.donorName}</td>
                                    <td>{d.donorAddress}</td>
                                    <td>{d.donorContact}</td>
                                    <td>
                                        {`${convertToBanglaDigits(
                                            Number(d.donateAmount || 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                        )} ৳`}
                                    </td>
                                    <td className='space-x-1'>
                                        <button className='btn btn-sm bg-yellow-500' onClick={() => openEdit(d)}>
                                            <FaRegEdit />
                                        </button>
                                        <button className='btn btn-sm bg-red-500 text-white' onClick={() => handleDelete(d._id)}>
                                            <MdDeleteForever />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Totals */}
                        {!noResults && (
                            <tfoot>
                                <tr className='bg-gray-100 text-center font-bold'>
                                    <td colSpan={4}>মোট</td>
                                    <td>
                                        {convertToBanglaDigits(
                                            Number(totalDonateAmount).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                        )} ৳
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </section>

            {/* Pagination */}
            <section className='flex justify-center items-center'>
                <div className="flex items-center my-3 gap-2">
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
            </section>

            {/* Add Modal */}
            {addOpen && (
                <dialog open className="modal">
                    <div className="modal-box px-8">
                        <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2" onClick={() => setAddOpen(false)}>✕</button>
                        <h3 className="font-bold text-lg mb-2">নতুন দাতা যোগ করুন</h3>
                        <form onSubmit={handleAddSubmit} className="space-y-3">
                            <div className="form-control">
                                <label className="label"><span className="label-text">নাম</span></label>
                                <input
                                    type="text" className="input input-bordered w-full" required
                                    value={newDonor.donorName}
                                    onChange={e => setNewDonor(prev => ({ ...prev, donorName: e.target.value }))}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">ঠিকানা</span></label>
                                <input
                                    type="text" className="input input-bordered w-full"
                                    value={newDonor.donorAddress}
                                    onChange={e => setNewDonor(prev => ({ ...prev, donorAddress: e.target.value }))}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">যোগাযোগ</span></label>
                                <input
                                    type="text" className="input input-bordered w-full"
                                    value={newDonor.donorContact}
                                    onChange={e => setNewDonor(prev => ({ ...prev, donorContact: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="btn localBG text-white">Save</button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}

            {/* Edit Modal */}
            {editOpen && (
                <dialog open className="modal">
                    <div className="modal-box px-8">
                        <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2" onClick={() => setEditOpen(false)}>✕</button>
                        <h3 className="font-bold text-lg mb-2">দাতা সম্পাদনা</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-3">
                            <div className="form-control">
                                <label className="label"><span className="label-text">নাম</span></label>
                                <input
                                    type="text" className="input input-bordered w-full" required
                                    value={editFields.donorName}
                                    onChange={e => setEditFields(prev => ({ ...prev, donorName: e.target.value }))}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">ঠিকানা</span></label>
                                <input
                                    type="text" className="input input-bordered w-full"
                                    value={editFields.donorAddress}
                                    onChange={e => setEditFields(prev => ({ ...prev, donorAddress: e.target.value }))}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">যোগাযোগ</span></label>
                                <input
                                    type="text" className="input input-bordered w-full"
                                    value={editFields.donorContact}
                                    onChange={e => setEditFields(prev => ({ ...prev, donorContact: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="btn localBG text-white">Update</button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default DonorList;
