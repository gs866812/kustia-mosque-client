// src/pages/SubmitExpense.jsx
import React, { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import moment from "moment";
import toast from "react-hot-toast";
import useAxiosHook from "../../utils/useAxiosHook";
import ContextData from "../../ContextData";


const SubmitExpense = () => {
    const {
        setRefetch,
        expenseUnit,
        expenseCategory,
        expenseReference, } = useContext(ContextData); // Assuming ContextData is defined in DataProvider.jsx

    const axiosHook = useAxiosHook();
    //_________________________________________________________________________________________________________
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            date: new Date(),
            expense: "",
            amount: "",
            quantity: "",
            unit: "",
            expenseCategory: "",
            reference: "",
            note: "",
        },
    });

    const quantity = watch("quantity");
    //_________________________________________________________________________________________________________
    // mock/static lists (replace with DB-driven data later)
    const [unitOptions, setUnitOptions] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [references, setReferences] = useState([]);

    useEffect(() => {
        setUnitOptions(expenseUnit || []);
        setExpenseCategories(expenseCategory || []);
        setReferences(expenseReference || []);
    }, [expenseCategory, expenseUnit, expenseReference]);
    //_________________________________________________________________________________________________________
    // control whether the "add new" input is visible for each field
    const [newField, setNewField] = useState({
        unit: false,
        category: false,
        reference: false,
    });
    //_________________________________________________________________________________________________________
    const handleAddNewOption = (field, value) => {
        const trimmed = String(value || "").trim();
        if (!trimmed) {
            // if empty, just hide the add-new input
            setNewField((p) => ({ ...p, [field]: false }));
            return;
        }

        if (field === "unit") {
            setUnitOptions((prev) => {
                if (!prev.includes(trimmed)) return [...prev, trimmed];
                return prev;
            });
            setValue("unit", trimmed);
        }

        if (field === "category") {
            setExpenseCategories((prev) => {
                if (!prev.includes(trimmed)) return [...prev, trimmed];
                return prev;
            });
            setValue("expenseCategory", trimmed);
        }

        if (field === "reference") {
            setReferences((prev) => {
                if (!prev.includes(trimmed)) return [...prev, trimmed];
                return prev;
            });
            setValue("reference", trimmed);
        }

        setNewField((p) => ({ ...p, [field]: false }));
    };
    //_________________________________________________________________________________________________________
    const onSubmit = async (data) => {
        // Normalize numeric fields
        const amountNum = Number(data.amount) || 0;
        const quantityNum = data.quantity ? Number(data.quantity) || 0 : 0;
        const selectedDate = data.date || new Date();

        const payload = {
            ...data,
            amount: amountNum,
            quantity: quantityNum,
            date: moment(selectedDate).format("DD.MMM.YYYY"), // like 07.Aug.2025
            month: moment(selectedDate).format("MMMM"),
            year: moment(selectedDate).format("YYYY"),
        };

        try {
            const res = await axiosHook.post("/submitExpense", payload);
            if (res?.data?.insertedId || res?.data?.acknowledged) {
                setRefetch((prev) => !prev); // trigger refetch in parent component
                toast.success("খরচ সফলভাবে যুক্ত হয়েছে!");
                reset();
            } else {
                toast.error("সার্ভারে সমস্যা: সংরক্ষণ করা হয়নি");
            }
        } catch (err) {
            toast.error("সার্ভার ত্রুটি! আবার চেষ্টা করুন।", err.message);
        }
    };
    //_________________________________________________________________________________________________________

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">খরচের বিবরণ</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Date */}
                <div>
                    <label className="block mb-1 font-medium">তারিখ নির্বাচন করুন</label>
                    <Controller
                        control={control}
                        name="date"
                        defaultValue={new Date()}
                        rules={{ required: "তারিখ নির্বাচন আবশ্যক" }}
                        render={({ field }) => (
                            <DatePicker
                                className="input input-bordered w-full"
                                placeholderText="তারিখ নির্বাচন করুন"
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                maxDate={new Date()}
                                minDate={moment().subtract(6, "days").toDate()}
                                dateFormat="dd-MM-yyyy"
                            />
                        )}
                    />
                    {errors.date && (
                        <span className="text-red-500 text-sm">{errors.date.message}</span>
                    )}
                </div>

                {/* Expense (খরচ) */}
                <div>
                    <input
                        type="text"
                        placeholder="খরচের বিবরন লিখুন"
                        {...register("expense", { required: "খরচ লিখুন" })}
                        className="input input-bordered w-full"
                    />
                    {errors.expense && (
                        <span className="text-red-500 text-sm">{errors.expense.message}</span>
                    )}
                </div>

                {/* Amount (টাকার পরিমান) */}
                <div>
                    <input
                        type="text"
                        placeholder="টাকার পরিমান"
                        {...register("amount", {
                            required: "টাকার পরিমান লিখুন",
                            pattern: {
                                value: /^\d+$/,
                                message: "শুধু সংখ্যা লিখুন",
                            },
                        })}
                        className="input input-bordered w-full"
                    />
                    {errors.amount && (
                        <span className="text-red-500 text-sm">{errors.amount.message}</span>
                    )}
                </div>

                {/* Quantity (ঐচ্ছিক) */}
                <div>
                    <input
                        type="text"
                        placeholder="জিনিসের পরিমান (ঐচ্ছিক)"
                        {...register("quantity", {
                            pattern: {
                                value: /^\d+$/,
                                message: "শুধু সংখ্যা লিখুন",
                            },
                        })}
                        className="input input-bordered w-full"
                    />
                    {errors.quantity && (
                        <span className="text-red-500 text-sm">{errors.quantity.message}</span>
                    )}
                </div>

                {/* Unit (optional but required if quantity present) */}
                <div>
                    {!newField.unit ? (
                        <select
                            {...register("unit", {
                                validate: (v) =>
                                    !quantity || String(quantity).trim() === ""
                                        ? true
                                        : (v && v.trim() !== "") || "পরিমাণ থাকলে ইউনিট আবশ্যক",
                            })}
                            className="select select-bordered w-full"
                            onChange={(e) =>
                                e.target.value === "ADD_NEW"
                                    ? setNewField((p) => ({ ...p, unit: true }))
                                    : setValue("unit", e.target.value)
                            }
                        >
                            <option value="">ইউনিট নির্বাচন করুন (ঐচ্ছিক)</option>
                            {unitOptions.map((u, i) => (
                                <option key={i} value={u}>
                                    {u}
                                </option>
                            ))}
                            <option value="ADD_NEW">নতুন ইউনিট যোগ করুন...</option>
                        </select>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="নতুন ইউনিট লিখুন"
                                className="input input-bordered w-full"
                                onBlur={(e) => handleAddNewOption("unit", e.target.value)}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded"
                                onClick={() => {
                                    setNewField((p) => ({ ...p, unit: false }));
                                    setValue("unit", ""); // clear temporary value
                                }}
                            >
                                বাতিল
                            </button>
                        </div>
                    )}
                    {errors.unit && (
                        <span className="text-red-500 text-sm">{errors.unit.message}</span>
                    )}
                </div>

                {/* Expense Category (required) */}
                <div>
                    {!newField.category ? (
                        <select
                            {...register("expenseCategory", { required: "ক্যাটাগরি নির্বাচন করুন" })}
                            className="select select-bordered w-full"
                            onChange={(e) =>
                                e.target.value === "ADD_NEW"
                                    ? setNewField((p) => ({ ...p, category: true }))
                                    : setValue("expenseCategory", e.target.value)
                            }
                        >
                            <option value="">ব্যয়ের ক্যাটাগরি নির্বাচন করুন</option>
                            {expenseCategories.map((c, i) => (
                                <option key={i} value={c}>
                                    {c}
                                </option>
                            ))}
                            <option value="ADD_NEW">নতুন ক্যাটাগরি যোগ করুন...</option>
                        </select>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="নতুন ক্যাটাগরি লিখুন"
                                className="input input-bordered w-full"
                                onBlur={(e) => handleAddNewOption("category", e.target.value)}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded"
                                onClick={() => {
                                    setNewField((p) => ({ ...p, category: false }));
                                    setValue("expenseCategory", ""); // clear temporary value
                                }}
                            >
                                বাতিল
                            </button>
                        </div>
                    )}
                    {errors.expenseCategory && (
                        <span className="text-red-500 text-sm">
                            {errors.expenseCategory.message}
                        </span>
                    )}
                </div>

                {/* Reference (required) */}
                <div>
                    {!newField.reference ? (
                        <select
                            {...register("reference", { required: "রেফারেন্স নির্বাচন করুন" })}
                            className="select select-bordered w-full"
                            onChange={(e) =>
                                e.target.value === "ADD_NEW"
                                    ? setNewField((p) => ({ ...p, reference: true }))
                                    : setValue("reference", e.target.value)
                            }
                        >
                            <option value="">রেফারেন্স নির্বাচন করুন</option>
                            {references.map((r, i) => (
                                <option key={i} value={r}>
                                    {r}
                                </option>
                            ))}
                            <option value="ADD_NEW">নতুন রেফারেন্স যোগ করুন...</option>
                        </select>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="নতুন রেফারেন্স লিখুন"
                                className="input input-bordered w-full"
                                onBlur={(e) => handleAddNewOption("reference", e.target.value)}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded"
                                onClick={() => {
                                    setNewField((p) => ({ ...p, reference: false }));
                                    setValue("reference", "");
                                }}
                            >
                                বাতিল
                            </button>
                        </div>
                    )}
                    {errors.reference && (
                        <span className="text-red-500 text-sm">{errors.reference.message}</span>
                    )}
                </div>

                {/* Note (optional) */}
                <div>
                    <textarea
                        placeholder="নোট (ঐচ্ছিক)"
                        className="textarea textarea-bordered w-full"
                        {...register("note")}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="btn btn-warning"
                    >
                        রিসেট
                    </button>
                    <button type="submit" className="btn localBG text-white">
                        সাবমিট করুন
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitExpense;
