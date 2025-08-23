import React, { useContext, useEffect, useState } from "react";
import ContextData from "../../ContextData";
import useAxiosSecure from "../../utils/useAxiosSecure";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const KINDS = [
  { key: "incomeCategories", label: "আয়ের ক্যাটাগরি (Donations)" },
  { key: "expenseCategories", label: "খরচের ক্যাটাগরি (Expenses)" },
  { key: "units", label: "ইউনিট (Donations)" },
  { key: "expenseUnits", label: "ইউনিট (Expenses)" },
  { key: "references", label: "রেফারেন্স (Donations)" },
  { key: "expenseReferences", label: "রেফারেন্স (Expenses)" },
];

const labels = {
  pageTitle: "তালিকা ব্যবস্থাপনা",
  searchPlaceholder: "খুঁজুন...",
  addNew: "নতুন যোগ করুন",
  valueLabel: "মান",
  actions: "অ্যাকশন",
  save: "সেভ",
  update: "আপডেট",
  cancel: "বাতিল",
  noData: "কোনো তথ্য পাওয়া যায়নি",
};

const MetaManager = () => {
  const { user, refetch, setRefetch } = useContext(ContextData);
  const axiosSecure = useAxiosSecure();

  const [kind, setKind] = useState(KINDS[0].key);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [newValue, setNewValue] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editValue, setEditValue] = useState("");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // fetch list
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
        setList(res?.data?.data || []);
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
    const pages = [];
    const maxButtons = 5;

    pages.push(
      <button
        key="prev"
        className="btn btn-sm"
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
          className={`btn btn-sm ${currentPage === 1 ? "localBG text-white" : ""}`}
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
          className={`btn btn-sm ${currentPage === i ? "localBG text-white" : ""}`}
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
          className={`btn btn-sm ${currentPage === totalPages ? "localBG text-white" : ""}`}
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
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      >
        Next
      </button>
    );

    return pages;
  };

  // add
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newValue?.trim()) return toast.error("মান লিখুন");

    try {
      const res = await axiosSecure.post(
        "/meta",
        { kind, value: newValue.trim() },
        { params: { email: user.email } }
      );
      if (res?.data?.insertedId) {
        toast.success("যুক্ত হয়েছে!");
        setNewValue("");
        setAddOpen(false);
        setRefetch((p) => !p);
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

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editRow?._id) return;
    if (!editValue?.trim()) return toast.error("মান লিখুন");

    try {
      const res = await axiosSecure.put(
        `/meta/${editRow._id}`,
        { kind, value: editValue.trim() },
        { params: { email: user.email } }
      );
      if (res?.data?.modifiedCount > 0 || res?.data?.updated) {
        toast.success("আপডেট হয়েছে!");
        setEditOpen(false);
        setEditRow(null);
        setRefetch((p) => !p);
      } else {
        toast.error("কোনো পরিবর্তন নেই");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "আপডেট করতে সমস্যা হয়েছে");
    }
  };

  // delete
  const handleDelete = (row) => {
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
          setRefetch((p) => !p);
        } else {
          toast.error(res?.data?.message || "ডিলিট করা যায়নি");
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "ডিলিট করতে সমস্যা হয়েছে");
      }
    });
  };

  return (
    <div className="px-5">
      {/* Header */}
      <section className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{labels.pageTitle}</h2>
        <div className="flex items-center gap-2">
          <select
            className="select select-bordered"
            value={kind}
            onChange={(e) => { setKind(e.target.value); setCurrentPage(1); setSearch(""); }}
          >
            {KINDS.map((k) => (
              <option key={k.key} value={k.key}>{k.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            className="input input-bordered"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />

          <button className="btn localBG text-white" onClick={() => setAddOpen(true)}>
            {labels.addNew}
          </button>
        </div>
      </section>

      {/* Table */}
      <section>
        <div className="overflow-x-auto my-5">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-gray-200 text-center">
                <th>#</th>
                <th>{labels.valueLabel}</th>
                <th>{labels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {noResults ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    {labels.noData}
                  </td>
                </tr>
              ) : (
                list.map((row, idx) => (
                  <tr key={row._id} className="text-center hover:bg-gray-100">
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td>{row.value}</td>
                    <td className="space-x-1">
                      <button className="btn btn-sm bg-yellow-500" onClick={() => openEdit(row)}>
                        <FaRegEdit />
                      </button>
                      <button className="btn btn-sm bg-red-500 text-white" onClick={() => handleDelete(row)}>
                        <MdDeleteForever />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      <section className="flex justify-center items-center">
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
            <button
              className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2"
              onClick={() => setAddOpen(false)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-2">{labels.addNew}</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="form-control">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="মান লিখুন"
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end">
                <button className="btn localBG text-white">{labels.save}</button>
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
            <h3 className="font-bold text-lg mb-2">সম্পাদনা</h3>
            <form onSubmit={handleEdit} className="space-y-3">
              <div className="form-control">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="নতুন মান লিখুন"
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end">
                <button className="btn localBG text-white">{labels.update}</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default MetaManager;
