import React, { useContext, useEffect, useState } from 'react';
import AddExpenseModal from '../Modal/AddExpenseModal';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { convertToBanglaDigits } from '../../utils/convertNumber';
import DatePicker from "react-datepicker";
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import toast from 'react-hot-toast';
import moment from 'moment';
import ContextData from '../../ContextData';
import Swal from 'sweetalert2';

const ExpenseList = () => {
  const { user, refetch, setRefetch, expenseReference = [], expenseCategory = [] } = useContext(ContextData);
  const axiosSecure = useAxiosSecure();

  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [editExpense, setEditExpense] = useState(null);
  const [editFields, setEditFields] = useState({
    date: null,
    expense: '',
    amount: '',
    quantity: '',
    expenseCategory: '',
    reference: '',
    note: ''
  });



  // ---- fetch expense list ----
  useEffect(() => {
    if (!user?.email) return;
    const fetchExpenseList = async () => {
      try {
        const res = await axiosSecure.get(`/expenseList`, {
          params: {
            email: user.email,
            search,
            category,
            startDate: startDate ? startDate.toISOString() : "",
            endDate: endDate ? endDate.toISOString() : "",
            page: currentPage,
            limit: itemsPerPage
          }
        });

        if (res?.data) {
          setExpenses(res.data.data);
          setTotalAmount(res.data.totalAmount);
          setTotalQuantity(res.data.totalQuantity);
          setTotalCount(res.data.totalCount);
        }
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchExpenseList();
  }, [axiosSecure, refetch, user?.email, search, category, startDate, endDate, currentPage, itemsPerPage]);

  // ---- pagination renderer (same style as DonationList) ----
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const renderPagination = () => {
    let pages = [];
    const maxButtons = 5;

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

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

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

  // ---- delete ----
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
          const res = await axiosSecure.delete(`/deleteExpense/${id}?email=${user.email}`);
          if (res?.data?.deletedCount > 0) {
            toast.success("খরচটি সফলভাবে ডিলেট হয়েছে!");
          }
          setRefetch(prev => !prev);
        } catch (err) {
          toast.error("খরচটি ডিলেট করা যায়নি", err.message);
        }
      }
    });
  };

  // ---- edit open ----
  const handleEdit = (expenseItem) => {
    const modal = document.getElementById("editExpenseModal");
    modal.showModal();
    setEditExpense(expenseItem);

    const parsed = moment(expenseItem?.date, "DD.MMM.YYYY", true);
    setEditFields({
      date: parsed.isValid() ? parsed.toDate() : null,
      expense: expenseItem?.expense ?? '',
      amount: expenseItem?.amount ?? '',
      quantity: expenseItem?.quantity ?? '',
      expenseCategory: expenseItem?.expenseCategory ?? '',
      reference: expenseItem?.reference ?? '',
      note: expenseItem?.note ?? ''
    });
  };

  // ---- edit submit ----
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email || !editExpense?._id) return;

    try {
      const payload = {
        date: editFields.date
          ? moment(editFields.date).format("DD.MMM.YYYY")
          : editExpense.date,
        expense: editFields.expense,
        amount: Number(editFields.amount) || 0,
        quantity: Number(editFields.quantity) || 0,
        expenseCategory: editFields.expenseCategory,
        reference: editFields.reference,
        note: editFields.note
      };

      const res = await axiosSecure.put(
        `/updateExpense/${editExpense._id}`,
        payload,
        { params: { email: user.email } }
      );

      if (res?.data?.modifiedCount > 0) {
        toast.success("খরচটি সফলভাবে আপডেট হয়েছে!");
        setRefetch(prev => !prev);
        document.getElementById("editExpenseModal").close();
      } else {
        toast.error("কোনো পরিবর্তন করা হয়নি।");
      }
    } catch (err) {
      console.error(err);
      toast.error("আপডেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className='px-5'>
      <section className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold'>খরচের তালিকা</h2>
        <AddExpenseModal />
      </section>

      {/* Filters */}
      <section className="flex justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />

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
            {expenseCategory.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Table */}
      <section>
        <div className="overflow-x-auto my-5">
          <table className="table table-zebra">
            <thead>
              <tr className='bg-gray-200 text-center'>
                <th>খরচের নাম</th>
                <th>টাকার পরিমাণ</th>
                <th>জিনিসের পরিমান</th>
                <th>ক্যাটাগরি</th>
                <th>রেফারেন্স</th>
                <th>নোট</th>
                <th>তারিখ</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item._id} className='hover:bg-gray-100 text-center'>
                  <td>{item.expense}</td>
                  <td>
                    {`${convertToBanglaDigits(
                      (Number(item.amount) || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    )} ৳`}
                  </td>
                  <td>
                    {convertToBanglaDigits(
                      Number(item.quantity || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    )} {item.unit && item.unit}
                  </td>
                  <td>{item.expenseCategory}</td>
                  <td>{item.reference}</td>
                  <td>{item.note}</td>
                  <td>{item.date}</td>
                  <td className='space-x-1'>
                    <button
                      className='btn btn-sm bg-yellow-500'
                      onClick={() => handleEdit(item)}
                    >
                      <FaRegEdit />
                    </button>
                    <button
                      className='btn btn-sm bg-red-500 text-white'
                      onClick={() => handleDelete(item._id)}
                    >
                      <MdDeleteForever />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Totals (entire filtered set) */}
            <tfoot>
              <tr className='bg-gray-100 text-center font-bold'>
                <td>মোট</td>
                <td>{convertToBanglaDigits(totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }))}</td>
                <td>{convertToBanglaDigits(totalQuantity.toLocaleString(undefined, { minimumFractionDigits: 2 }))}</td>
                <td colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Edit Modal */}
      <section>
        <dialog id="editExpenseModal" className="modal">
          <div className="modal-box px-8">
            <form method="dialog">
              <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">খরচ সম্পাদনা</h3>

            <form onSubmit={handleEditSubmit} className="space-y-3 my-0">
              {/* Date */}
              <div className="form-control">
                <DatePicker
                  selected={editFields.date}
                  onChange={(d) => setEditFields(prev => ({ ...prev, date: d }))}
                  dateFormat="dd.MMM.yyyy"
                  placeholderText="Select date"
                  className="input input-bordered w-full"
                  isClearable
                />
              </div>

              {/* Expense name */}
              <div className="form-control">
                <label className="label"><span className="label-text">খরচের নাম</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editFields.expense}
                  onChange={(e) => setEditFields(prev => ({ ...prev, expense: e.target.value }))}
                  placeholder="Expense"
                />
              </div>

              {/* Amount */}
              <div className="form-control">
                <label className="label"><span className="label-text">টাকার পরিমাণ</span></label>
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
                <label className="label"><span className="label-text">পরিমান</span></label>
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
                <label className="label"><span className="label-text">ক্যাটাগরি</span></label>
                <select
                  className="select select-bordered w-full"
                  value={editFields.expenseCategory}
                  onChange={(e) => setEditFields(prev => ({ ...prev, expenseCategory: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {expenseCategory.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Reference (from Context) */}
              <div className="form-control">
                <label className="label"><span className="label-text">রেফারেন্স</span></label>
                <select
                  className="select select-bordered w-full"
                  value={editFields.reference}
                  onChange={(e) => setEditFields(prev => ({ ...prev, reference: e.target.value }))}
                >
                  <option value="">Select reference</option>
                  {expenseReference.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div className="form-control">
                <label className="label"><span className="label-text">নোট</span></label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  value={editFields.note}
                  onChange={(e) => setEditFields(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Note"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button className="btn localBG text-white">সম্পাদন</button>
              </div>
            </form>
          </div>
        </dialog>
      </section>

      {/* Pagination */}
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

export default ExpenseList;
