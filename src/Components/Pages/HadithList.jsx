import { useContext, useEffect, useState } from 'react';
import AddHadithModal from '../Modal/AddHadithModal';
import ContextData from '../../ContextData';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const HadithList = () => {
    const { user, refetch, setRefetch } = useContext(ContextData);

    const [hadith, setHadith] = useState([]);
    const [searchHadith, setSearchHadith] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalHadith, setTotalHadith] = useState(0);
    const [editHadith, setEditHadith] = useState('');

    const axiosSecure = useAxiosSecure();


    // *******************************************************************************************************
    useEffect(() => {
        if (!user?.email) return;
        const fetchHadithList = async () => {
            try {
                const res = await axiosSecure.get(`/hadithList`, {
                    params: {
                        email: user.email,
                        search: searchHadith,
                        page: currentPage,
                        limit: itemsPerPage
                    }
                });

                if (res?.data) {
                    setHadith(res.data.data);
                    setTotalHadith(res.data.total);
                } else {
                    toast.error("No hadith data found");
                }
            } catch (err) {
                console.error("Error fetching hadith list:", err.message);
            }
        };

        fetchHadithList();
    }, [searchHadith, currentPage, itemsPerPage, user?.email, refetch, axiosSecure]);
    // *******************************************************************************************************
    const handleEdit = (hadith) => {
        const modal = document.getElementById("editHadithModal");
        modal.showModal();
        setEditHadith(hadith);

    }

    // *******************************************************************************************************
    const handleEditHadith = async (e) => {
        e.preventDefault();
        const modal = document.getElementById("editHadithModal");
        try {

            const res = await axiosSecure.put(`/editHadith/${editHadith?._id}`, { hadith: editHadith?.hadith, email: user.email });
            if (res?.data?.modifiedCount > 0) {
                toast.success("হাদিস সফলভাবে আপডেট হয়েছে!");
                setRefetch(prev => !prev);
                setEditHadith('');
                modal.close();
            } else {
                toast.error("হাদিস আপডেট করতে ব্যর্থ হয়েছে।");
            }
        } catch (err) {
            console.error(err);
            toast.error("সার্ভার ত্রুটি, আবার চেষ্টা করুন।");
        }

    };
    // *******************************************************************************************************
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
                if (!user?.email) return;
                try {
                    const res = await axiosSecure.delete(`/hadith/${id}?email=${user.email}`);
                    if (res?.data?.deletedCount > 0) {
                        toast.success("হাদিস সফলভাবে ডিলেট হয়েছে!");
                    }
                    setRefetch(prev => !prev);
                } catch (err) {
                    toast.error("হাদীসটি ডিলেট করা যায়নি", err.message);
                }

            }
        });


    };
    // *******************************************************************************************************
    const totalPages = Math.ceil(totalHadith / itemsPerPage);
    const renderPagination = () => {
        let pages = [];
        const maxButtons = 5; // Show at most 5 page buttons

        // Prev button
        pages.push(
            <button
                key="prev"
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
            >
                Prev
            </button>
        );

        // Calculate visible range
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = startPage + maxButtons - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // If starting page > 1, show first page & dots
        if (startPage > 1) {
            pages.push(
                <button key={1} className={`btn btn-sm ${currentPage === 1 ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
            );
            if (startPage > 2) pages.push(<span key="dots-start" className="px-2">...</span>);
        }

        // Middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`btn btn-sm hover:localBG ${currentPage === i ? 'localBG text-white' : ''}`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }

        // If ending page < totalPages, show dots & last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push(<span key="dots-end" className="px-2">...</span>);
            pages.push(
                <button key={totalPages} className={`btn btn-sm ${currentPage === totalPages ? 'btn-primary' : ''}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
            >
                Next
            </button>
        );

        return pages;
    };


    // *******************************************************************************************************
    return (
        <div className='px-5'>

            <section className='flex justify-between items-center'>
                <h2 className='text-2xl font-semibold'>হাদীস সমূহ</h2>
                <div className='flex gap-1 w-1/2 justify-end'>
                    <input
                        type="text"
                        placeholder="হাদিস খুঁজুন"
                        className="input input-bordered max-w-xs mt-3"
                        value={searchHadith}
                        onChange={(e) => {
                            setSearchHadith(e.target.value);
                            setCurrentPage(1); // reset to first page on search
                        }}
                    />
                    <AddHadithModal />
                </div>
            </section>

            <section>
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full mt-5">
                        {/* head */}
                        <thead>
                            <tr className='rounded-lg bg-gray-200'>
                                <th className='w-[8%]'>তারিখ</th>
                                <th className='text-center'>হাদিস লিস্ট</th>
                                <th className='w-[10%]'>অ্যাকশন</th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                hadith.map((hadithItem, index) => (
                                    <tr key={index}>
                                        <td>{hadithItem.date}</td>
                                        <td className='text-center'>{hadithItem.hadith}</td>
                                        <td className=''>
                                            <button className='btn btn-sm bg-yellow-500'
                                                onClick={() => { handleEdit(hadithItem) }}>
                                                <FaRegEdit />
                                            </button>
                                            <button className='btn btn-sm bg-red-500 text-white'
                                                onClick={() => handleDelete(hadithItem._id)}>
                                                <MdDeleteForever />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </div>

            </section>
            {/* Pagination Controls */}
            <section className='flex justify-center items-center'>
                <div className="flex items-center my-3">
                    <div className="flex gap-1">
                        {renderPagination()}
                    </div>
                    <select
                        className="border border-gray-300 rounded-md py-1"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </section>
            {/* edit hadith modal */}
            <dialog id="editHadithModal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2">
                            ✕
                        </button>
                    </form>
                    <h3 className="font-bold text-lg">হাদিস সম্পাদনা</h3>
                    <form
                        onSubmit={handleEditHadith}
                        className="space-y-4">
                        <textarea
                            className="textarea textarea-bordered w-full mt-2"
                            placeholder="এখানে হাদিস লিখুন"
                            defaultValue={editHadith?.hadith || ""}
                            maxLength={150}
                            onChange={(e) => setEditHadith({ ...editHadith, hadith: e.target.value })}
                        />
                        <div className="text-sm text-gray-500">
                            {editHadith?.hadith?.length || 0}/150 অক্ষর
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="btn localBG text-white"
                            >
                                সম্পাদন
                            </button>
                        </div>
                    </form>

                </div>
            </dialog>
        </div>
    );
};

export default HadithList;