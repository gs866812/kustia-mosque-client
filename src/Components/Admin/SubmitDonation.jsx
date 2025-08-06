import React, { useState } from "react";
import { useForm } from "react-hook-form";
import moment from "moment";
import useAxiosHook from "../../utils/axiosHook";


const SubmitDonation = () => {
    const axiosHook = useAxiosHook(); // Assuming you have a custom hook for axios requests
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    // Initial static values
    const [addressList, setAddressList] = useState(["কুষ্টিয়া", "ঝিনাইদহ"]);
    const [incomeCategories, setIncomeCategories] = useState(["যাকাত", "সদকা"]);
    const [unitOptions, setUnitOptions] = useState(["কেজি", "পিস"]);
    const [references, setReferences] = useState(["মোঃ কামরুল", "মোঃ রহিম"]);

    const [newField, setNewField] = useState({
        address: false,
        category: false,
        unit: false,
        reference: false,
    });

    const watchFields = {
        address: watch("address"),
        incomeCategory: watch("incomeCategory"),
        unit: watch("unit"),
        reference: watch("reference"),
    };

    const handleAddNewOption = (field, value) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        const setMap = {
            address: setAddressList,
            category: setIncomeCategories,
            unit: setUnitOptions,
            reference: setReferences,
        };

        const newValueMap = {
            address: "address",
            category: "incomeCategory",
            unit: "unit",
            reference: "reference",
        };

        setMap[field]((prev) => [...prev, trimmed]);
        setValue(newValueMap[field], trimmed);
        setNewField((prev) => ({ ...prev, [field]: false }));
    };

    const onSubmit = async (data) => {
        const fullData = {
            ...data,
            date: moment().format("DD.MM.YYYY"),
            month: moment().format("MMMM"),
            year: moment().format("YYYY"),
        };
        console.log(fullData);

        // try {
        //   const res = await axiosHook.post("/submitDonation", fullData);
        //   if (res?.data?.insertedId || res?.data?.acknowledged) {
        //     alert("ডোনেশন সফলভাবে যুক্ত হয়েছে!");
        //     reset();
        //   }
        // } catch (err) {
        //   console.error(err);
        //   alert("সার্ভার ত্রুটি! আবার চেষ্টা করুন।");
        // }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-md mt-6">
            <h2 className="text-xl font-bold mb-4 text-center">দাতার বিবরণ</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                    type="text"
                    placeholder="আইডি (ঐচ্ছিক)"
                    {...register("donorId")}
                    className="input input-bordered w-full"
                />

                <input
                    type="text"
                    placeholder="দাতার নাম"
                    {...register("donorName", { required: true })}
                    className="input input-bordered w-full"
                />

                {/* Address */}
                {!newField.address ? (
                    <select
                        {...register("address", { required: true })}
                        className="select select-bordered w-full"
                        onChange={(e) =>
                            e.target.value === "ADD_NEW"
                                ? setNewField({ ...newField, address: true })
                                : setValue("address", e.target.value)
                        }
                    >
                        <option value="">ঠিকানা নির্বাচন করুন</option>
                        {addressList.map((item, idx) => (
                            <option key={idx} value={item}>
                                {item}
                            </option>
                        ))}
                        <option value="ADD_NEW">নতুন ঠিকানা যোগ করুন...</option>
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="নতুন ঠিকানা লিখুন"
                        className="input input-bordered w-full"
                        onBlur={(e) => handleAddNewOption("address", e.target.value)}
                        autoFocus
                    />
                )}

                {/* Phone */}
                <input
                    type="text"
                    placeholder="দাতার মোবাইল নাম্বার (ঐচ্ছিক)"
                    {...register("phone", {
                        pattern: /^[0-9]*$/,
                    })}
                    className="input input-bordered w-full"
                />

                {/* Category */}
                {!newField.category ? (
                    <select
                        {...register("incomeCategory", { required: true })}
                        className="select select-bordered w-full"
                        onChange={(e) =>
                            e.target.value === "ADD_NEW"
                                ? setNewField({ ...newField, category: true })
                                : setValue("incomeCategory", e.target.value)
                        }
                    >
                        <option value="">আয়ের ক্যাটাগরি নির্বাচন করুন</option>
                        {incomeCategories.map((item, idx) => (
                            <option key={idx} value={item}>
                                {item}
                            </option>
                        ))}
                        <option value="ADD_NEW">নতুন ক্যাটাগরি যোগ করুন...</option>
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="নতুন ক্যাটাগরি লিখুন"
                        className="input input-bordered w-full"
                        onBlur={(e) => handleAddNewOption("category", e.target.value)}
                        autoFocus
                    />
                )}

                {/* Amount */}
                <input
                    type="text"
                    placeholder="টাকার পরিমান"
                    {...register("amount", {
                        required: true,
                        pattern: /^\d+$/,
                    })}
                    className="input input-bordered w-full"
                />

                {/* Quantity */}
                <input
                    type="text"
                    placeholder="পরিমাণ"
                    {...register("quantity", {
                        required: true,
                        pattern: /^\d+$/,
                    })}
                    className="input input-bordered w-full"
                />

                {/* Unit */}
                {!newField.unit ? (
                    <select
                        {...register("unit", { required: true })}
                        className="select select-bordered w-full"
                        onChange={(e) =>
                            e.target.value === "ADD_NEW"
                                ? setNewField({ ...newField, unit: true })
                                : setValue("unit", e.target.value)
                        }
                    >
                        <option value="">ইউনিট নির্বাচন করুন</option>
                        {unitOptions.map((item, idx) => (
                            <option key={idx} value={item}>
                                {item}
                            </option>
                        ))}
                        <option value="ADD_NEW">নতুন ইউনিট যোগ করুন...</option>
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="নতুন ইউনিট লিখুন"
                        className="input input-bordered w-full"
                        onBlur={(e) => handleAddNewOption("unit", e.target.value)}
                        autoFocus
                    />
                )}

                {/* Payment Option */}
                <select
                    {...register("paymentOption", { required: true })}
                    className="select select-bordered w-full"
                >
                    <option value="নগদ টাকা গ্রহণ">নগদ টাকা গ্রহণ</option>
                    <option value="বিকাশ একাউন্ট">বিকাশ একাউন্ট</option>
                    <option value="নগদ একাউন্ট">নগদ একাউন্ট</option>
                    <option value="ব্যাংক একাউন্ট">ব্যাংক একাউন্ট</option>
                </select>

                {/* Reference */}
                {!newField.reference ? (
                    <select
                        {...register("reference", { required: true })}
                        className="select select-bordered w-full"
                        onChange={(e) =>
                            e.target.value === "ADD_NEW"
                                ? setNewField({ ...newField, reference: true })
                                : setValue("reference", e.target.value)
                        }
                    >
                        <option value="">রেফারেন্স নির্বাচন করুন</option>
                        {references.map((item, idx) => (
                            <option key={idx} value={item}>
                                {item}
                            </option>
                        ))}
                        <option value="ADD_NEW">নতুন রেফারেন্স যোগ করুন...</option>
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="নতুন রেফারেন্স লিখুন"
                        className="input input-bordered w-full"
                        onBlur={(e) => handleAddNewOption("reference", e.target.value)}
                        autoFocus
                    />
                )}

                <div className="flex justify-between pt-2">

                    <button type="button" onClick={() => reset()} className="btn btn-warning">
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

export default SubmitDonation;
