import React, { useContext, useEffect, useState } from 'react';
import AddDonationModal from '../Modal/AddDonationModal';
import ContextData from '../../ContextData';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { convertToBanglaDigits } from '../../utils/convertNumber';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import moment from 'moment';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HindBase64 from '../../../src/pdf/fonts/HindSiliguri-Regular.js';





const DonationList = () => {
    const { user, refetch, setRefetch, reference, address = [] } = useContext(ContextData);

    const axiosSecure = useAxiosSecure();

    const [donation, setDonation] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    // const [unit, setUnit] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [editDonation, setEditDonation] = useState('');
    const [exporting, setExporting] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(search);


    const [editFields, setEditFields] = useState({
        date: null,           // Date object for DatePicker
        amount: '',
        quantity: '',
        unit: '',
        donorName: '',
        address: '',
        phone: '',
        paymentOption: '',
        incomeCategory: '',
        reference: ''
    });

    const PAYMENT_OPTIONS = [
        "নগদ টাকা গ্রহণ",
        "বিকাশ একাউন্ট",
        "নগদ একাউন্ট",
        "ব্যাংক একাউন্ট",
    ];

    // * ******************************************************************************************************
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);
    // * ******************************************************************************************************


    useEffect(() => {
        if (!user?.email) return;

        const fetchCategories = async () => {
            try {
                const res = await axiosSecure.get("/donationCategories", {
                    params: { email: user.email },
                });
                setCategories(res?.data?.sorted || []);
                setUnits(res?.data?.sortedUnit || []);
            } catch (err) {
                console.error("Category fetch error:", err.message);
            }
        };

        fetchCategories();
    }, [axiosSecure, user?.email]);

    // * ******************************************************************************************************
    useEffect(() => {
        if (!user?.email) return;

        const fetchDonationList = async () => {
            try {
                const res = await axiosSecure.get(`/donationList`, {
                    params: {
                        email: user.email,
                        search: debouncedSearch,
                        category,
                        startDate: startDate ? startDate.toISOString() : "",
                        endDate: endDate ? endDate.toISOString() : "",
                        page: currentPage,
                        limit: itemsPerPage
                    }
                });

                if (res?.data) {
                    setDonation(res.data.data);
                    setTotalAmount(res.data.totalAmount);
                    setTotalQuantity(res.data.totalQuantity);
                    setTotalCount(res.data.totalCount);
                }
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchDonationList();
    }, [axiosSecure, refetch, user?.email, search, debouncedSearch, category, startDate, endDate, currentPage, itemsPerPage]);
    // * ******************************************************************************************************
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const renderPagination = () => {
        let pages = [];
        const maxButtons = 5; // Show at most 5 page buttons

        // Prev
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
                <button
                    key={1}
                    className={`btn btn-sm ${currentPage === 1 ? 'btn-primary' : ''}`}
                    onClick={() => setCurrentPage(1)}
                >
                    1
                </button>
            );
            if (startPage > 2) pages.push(<span key="dots-start" className="px-2">...</span>);
        }

        // Middle
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
                <button
                    key={totalPages}
                    className={`btn btn-sm ${currentPage === totalPages ? 'btn-primary' : ''}`}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        // Next
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
    // * ******************************************************************************************************
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
                    const res = await axiosSecure.delete(`/deleteDonation/${id}?email=${user.email}`);
                    if (res?.data?.deletedCount > 0) {
                        toast.success("দানটি সফলভাবে ডিলেট হয়েছে!");
                    }
                    setRefetch(prev => !prev);
                } catch (err) {
                    toast.error("দানটি ডিলেট করা যায়নি", err.message);
                }

            }
        });
    };
    // * ******************************************************************************************************
    const handleEdit = (donationItem) => {
        const modal = document.getElementById("editDonationModal");
        modal.showModal();
        setEditDonation(donationItem);

        const parsed = moment(donationItem?.date, "DD.MMM.YYYY", true);
        setEditFields({
            date: parsed.isValid() ? parsed.toDate() : null,
            amount: donationItem?.amount ?? '',
            quantity: donationItem?.quantity ?? '',
            unit: donationItem?.unit ?? '',
            donorName: donationItem?.donorName || '',
            address: donationItem?.address || '',
            phone: donationItem?.phone || '',
            paymentOption: donationItem?.paymentOption ?? '',
            incomeCategory: donationItem?.incomeCategory ?? '',
            reference: donationItem?.reference ?? ''
        });
    };

    // * ******************************************************************************************************
    const handleEditDonation = async (e) => {
        e.preventDefault();
        if (!user?.email || !editDonation?._id) return;

        try {
            const payload = {
                // If user didn’t touch the date picker, keep old date string
                date: editFields.date
                    ? moment(editFields.date).format("DD.MMM.YYYY")
                    : editDonation.date,
                amount: Number(editFields.amount) || 0,
                quantity: Number(editFields.quantity) || 0,
                incomeCategory: editFields.incomeCategory,
                donorName: editFields.donorName,
                address: editFields.address,
                unit: editFields.unit,
                phone: editFields.phone,
                paymentOption: editFields.paymentOption,
                reference: editFields.reference
            };


            const res = await axiosSecure.put(
                `/updateDonation/${editDonation._id}`,
                payload,
                { params: { email: user.email } }
            );

            if (res?.data?.modifiedCount > 0) {
                toast.success("দানটি সফলভাবে আপডেট হয়েছে!");
                setRefetch(prev => !prev);
                document.getElementById("editDonationModal").close();
            } else {
                toast.error("কোনো পরিবর্তন করা হয়নি।");
            }
        } catch (err) {
            console.error(err);
            toast.error("আপডেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
        }
    };

    // * ******************************************************************************************************
    // fetch the FULL filtered donation list (no pagination)
    const fetchAllDonationsForExport = async () => {
        if (!user?.email) return { data: [], totalAmount: 0, totalQuantity: 0, totalCount: 0 };
        const res = await axiosSecure.get('/donationList/export', {
            params: {
                email: user.email,
                search: debouncedSearch,
                category,
                startDate: startDate ? startDate.toISOString() : "",
                endDate: endDate ? endDate.toISOString() : "",
            }
        });
        return res?.data || { data: [], totalAmount: 0, totalQuantity: 0, totalCount: 0 };
    };

    // _______________________________________________________________________________________________________
    const handleDownloadExcel = async () => {
        try {
            setExporting(true);
            const { data, totalCount } = await fetchAllDonationsForExport();
            if (!totalCount) {
                toast.error("কোনো তথ্য নেই ডাউনলোড করার জন্য");
                return;
            }

            const rows = data.map(d => ({
                Donor_ID: d.donorId ?? "",
                Donor_Name: d.donorName ?? "",
                Address: d.address ?? "",
                Amount: Number(d.amount || 0),
                Quantity: Number(d.quantity || 0),
                Unit: d.unit ?? "",
                Income_Category: d.incomeCategory ?? "",
                Reference: d.reference ?? "",
                Date: d.date ?? "",
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);

            const headers = Object.keys(rows[0] || {
                Donor_ID: "", Donor_Name: "", Address: "", Amount: 0, Quantity: 0,
                Unit: "", Income_Category: "", Reference: "", Date: ""
            });
            const colWidths = headers.map(h => {
                const maxLen = Math.max(h.length, ...rows.map(r => String(r[h] ?? "").length));
                return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
            });
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Donations');

            const filename = `donations_${debouncedSearch ? `search_${debouncedSearch}_` : ""}${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (err) {
            console.error(err);
            toast.error("Excel তৈরি করতে সমস্যা হয়েছে");
        } finally {
            setExporting(false);
        }
    };


    // _______________________________________________________________________________________________________
    const handleDownloadPDF = async () => {
        try {
            setExporting(true);
            const { data, totalCount, totalAmount, totalQuantity } = await fetchAllDonationsForExport();
            if (!totalCount) {
                toast.error("কোনো তথ্য নেই ডাউনলোড করার জন্য");
                return;
            }

            const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

            const title = 'Donation List';
            doc.setFontSize(14);
            doc.text(title, 40, 40);
            doc.addFileToVFS('HindSiliguri-Regular.ttf', HindBase64);
            doc.addFont('HindSiliguri-Regular.ttf', 'HindSiliguri', 'normal');
            doc.setFont('HindSiliguri', 'normal');

            doc.setFontSize(10);
            const sub = [
                debouncedSearch ? `Search: "${debouncedSearch}"` : "All donations",
                category ? `Category: ${category}` : "All categories",
                startDate && endDate ? `Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : "No date filter",
                `Count: ${totalCount}`,
                `Total Amount: ${Number(totalAmount).toLocaleString()}`,
                `Total Qty: ${Number(totalQuantity).toLocaleString()}`
            ].join('  |  ');
            doc.text(sub, 40, 60);

            const head = [['Donor ID', 'Donor Name', 'Address', 'Amount', 'Qty', 'Unit', 'Income Category', 'Reference', 'Date']];
            const body = data.map(d => [
                d.donorId ?? '',
                d.donorName ?? '',
                d.address ?? '',
                Number(d.amount || 0).toLocaleString(),
                Number(d.quantity || 0).toLocaleString(),
                d.unit ?? '',
                d.incomeCategory ?? '',
                d.reference ?? '',
                d.date ?? ''
            ]);

            // ⬇️ use function import
            autoTable(doc, {
                startY: 80,
                head, body,
                styles: { font: 'HindSiliguri', fontSize: 10, cellPadding: 6, overflow: 'linebreak' },
                headStyles: { font: 'HindSiliguri', fillColor: [26,115,232], textColor: 255 },
                margin: { top: 80, bottom: 40, left: 40, right: 40 },
                // columnStyles: {
                //     0: { cellWidth: 70 },
                //     1: { cellWidth: 160 },
                //     2: { cellWidth: 220 },
                //     3: { cellWidth: 90, halign: 'right' },
                //     4: { cellWidth: 60, halign: 'right' },
                //     5: { cellWidth: 60 },
                //     6: { cellWidth: 150 },
                //     7: { cellWidth: 130 },
                //     8: { cellWidth: 90 },
                // },
                didDrawPage: () => {
                    const pageSize = doc.internal.pageSize;
                    const pageHeight = pageSize.height || pageSize.getHeight();
                    doc.setFontSize(9);
                    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, pageHeight - 20);
                },
            });

            const filename = `donations_${debouncedSearch ? `search_${debouncedSearch}_` : ""}${new Date().toISOString().slice(0, 10)}.pdf`;
            doc.save(filename);
        } catch (err) {
            console.error(err);
            toast.error("PDF তৈরি করতে সমস্যা হয়েছে");
        } finally {
            setExporting(false);
        }
    };




    // _______________________________________________________________________________________________________


    // * ******************************************************************************************************
    return (
        <div className='px-5'>

            <section className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-semibold'>সর্বমোট গৃহীত দানের তালিকা</h2>
                <AddDonationModal />
            </section>


            <section className="flex justify-between gap-3 mb-4">
                <div className='flex gap-2 items-center'>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input input-bordered"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                    <div className='flex gap-2 w-[50px]'>
                        <button className="cursor-pointer" type="button" onClick={handleDownloadExcel} disabled={exporting} title="Download Excel (full filtered list)">
                            <FaFileExcel className="text-green-600" size={20} />
                        </button>
                        <button className="cursor-pointer" type="button" onClick={handleDownloadPDF} disabled={exporting} title="Download PDF (full filtered list)">
                            <FaFilePdf className="text-red-500" size={20} />
                        </button>

                    </div>
                </div>




                <div className='flex gap-2'>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => { setStartDate(date); setCurrentPage(1); }}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className="input input-bordered"
                    />

                    <DatePicker
                        selected={endDate}
                        onChange={(date) => { setEndDate(date); setCurrentPage(1); }}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="End Date"
                        className="input input-bordered"
                    />

                    <select
                        className="select select-bordered"
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>


            </section>

            <section>
                <div className="overflow-x-auto my-5">
                    <table className="table table-zebra">
                        <thead>
                            <tr className='bg-gray-200 text-center'>
                                <th>আইডি</th>
                                <th>দাতার নাম</th>
                                <th>দাতার ঠিকানা</th>
                                <th>দানের পরিমাণ</th>
                                <th>জিনিসের পরিমান</th>
                                <th>আয়ের ক্যাটাগরি</th>
                                <th>আদায়কারী</th>
                                <th>তারিখ</th>
                                <th>অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donation.map((donationItem, index) => (
                                <tr key={index} className='hover:bg-gray-100 text-center'>
                                    <td>{convertToBanglaDigits(donationItem.donorId)}</td>
                                    <td>{donationItem.donorName}</td>
                                    <td>{donationItem.address}</td>
                                    <td>
                                        {`${convertToBanglaDigits(
                                            (Number(donationItem.amount) || 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                        )} ৳`}


                                    </td>
                                    <td>
                                        {convertToBanglaDigits(
                                            Number(donationItem.quantity || 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                        )} { }{donationItem.unit || ''}
                                    </td>
                                    <td>{donationItem.incomeCategory}</td>
                                    <td>{donationItem.reference}</td>
                                    <td>{donationItem.date}</td>

                                    <td className=''>
                                        <button className='btn btn-sm bg-yellow-500'
                                            onClick={() => { handleEdit(donationItem) }}>
                                            <FaRegEdit />
                                        </button>
                                        <button className='btn btn-sm bg-red-500 text-white'
                                            onClick={() => handleDelete(donationItem._id)}>
                                            <MdDeleteForever />
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                        {/* Total Row */}
                        <tfoot>
                            <tr className='bg-gray-100 text-center font-bold'>
                                <td colSpan={3}>মোট</td>
                                <td>{convertToBanglaDigits(totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }))}</td>
                                <td>{convertToBanglaDigits(totalQuantity.toLocaleString(undefined, { minimumFractionDigits: 2 }))}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>


            </section>
            {/* Edit Donation Modal */}
            <section>
                <dialog id="editDonationModal" className="modal">
                    <div className="modal-box px-8">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2">
                                ✕
                            </button>
                        </form>
                        <h3 className="font-bold text-lg">দানের তালিকা সম্পাদনা</h3>
                        <form onSubmit={handleEditDonation} className="space-y-3 my-0">

                            {/* Date */}
                            <div className="form-control">
                                <DatePicker
                                    selected={editFields.date}
                                    onChange={(d) => setEditFields(prev => ({ ...prev, date: d }))}
                                    dateFormat="dd.MMM.yyyy"
                                    placeholderText="Select date"
                                    className="input input-bordered w-full"
                                    maxDate={new Date()}
                                    isClearable
                                />

                            </div>

                            {/* Donor */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">দাতার নাম </span></label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={editFields.donorName}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, donorName: e.target.value }))}
                                    placeholder="Donor name"
                                />
                            </div>
                            {/* Address (from DB) */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">দাতার ঠিকানা</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={editFields.address}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, address: e.target.value }))}
                                >
                                    <option value="">Select address</option>
                                    {address.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Phone */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">দাতার মোবাইল </span></label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={editFields.phone}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Mobile number"
                                />
                            </div>
                            {/* Amount */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">দানের পরিমাণ</span></label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input input-bordered w-full"
                                    value={editFields.amount}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Amount"
                                />
                            </div>

                            {/* Quantity */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">জিনিসের পরিমান</span></label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input input-bordered w-full"
                                    value={editFields.quantity}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, quantity: e.target.value }))}
                                    placeholder="Quantity"
                                />
                            </div>

                            {/* Category (from DB) */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">আয়ের ক্যাটাগরি</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={editFields.incomeCategory}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, incomeCategory: e.target.value }))}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            {/* unit (from DB) */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">ইউনিট</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={editFields.unit}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, unit: e.target.value }))}
                                >
                                    <option value="">Select unit</option>
                                    {units.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Payment option (from DB) */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">পেমেন্ট অপশন</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={editFields.paymentOption || ""}
                                    onChange={(e) =>
                                        setEditFields((prev) => ({ ...prev, paymentOption: e.target.value }))
                                    }
                                >
                                    <option value="">Select payment option</option>
                                    {PAYMENT_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                    {/* Keep showing an existing non-listed value during edit */}
                                    {editFields.paymentOption &&
                                        !PAYMENT_OPTIONS.includes(editFields.paymentOption) && (
                                            <option value={editFields.paymentOption}>
                                                {editFields.paymentOption} (existing)
                                            </option>
                                        )}
                                </select>
                            </div>


                            {/* Reference (from Context) */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">আদায়কারী</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    value={editFields.reference}
                                    onChange={(e) => setEditFields(prev => ({ ...prev, reference: e.target.value }))}
                                >
                                    <option value="">Select reference</option>
                                    {reference.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button className="btn localBG text-white">সম্পাদন</button>
                            </div>
                        </form>


                    </div>
                </dialog>
            </section>

            {/* pagination */}
            <section className='flex justify-center items-center'>
                <div className="flex items-center my-3 gap-2">
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

        </div>
    );
};

export default DonationList;
