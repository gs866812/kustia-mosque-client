import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Controller, useForm, useWatch } from "react-hook-form";
import moment from "moment";
import toast from "react-hot-toast";
import ContextData from "../../ContextData";
import useAxiosHook from "../../utils/useAxiosHook";
import useAxiosSecure from "../../utils/useAxiosSecure";

// add this small helper near the top of the file (outside the component)



// small utility to clear donor-related fields
const resetDonorFields = (setValue) => {
    setValue("donorName", "");
    setValue("address", "");
    setValue("phone", "");
};



const SubmitDonation = () => {
    const axiosHook = useAxiosHook(); // Assuming you have a custom hook for axios requests
    const axiosSecure = useAxiosSecure(); // Assuming you have a custom hook for axios requests
    const { user, refetch, setRefetch, address, category, unit, reference } = useContext(ContextData); // Assuming you have a DataContext to get user info

    //_________________________________________________________________________________________________________
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            donorId: "",
            donorName: "",
            address: "",
            phone: "",
        },
    });



    const donorIdValue = useWatch({ control, name: "donorId" });


    // __________________________________________________________________________________________________________
    useEffect(() => {
        const idRaw = (donorIdValue ?? "").toString().trim();

        // If donorId is empty → reset and stop
        if (!idRaw) {
            resetDonorFields(setValue);
            return;
        }

        // If only numeric donorId is supported, validate it
        const idNum = Number(idRaw);
        if (!Number.isFinite(idNum)) {
            resetDonorFields(setValue);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const res = await axiosSecure.get(`/getDonorId/${idNum}`, {
                    params: { email: user?.email },
                });
                if (cancelled) return;

                const donor = res?.data;
                if (donor?.donorName) {
                    setValue("donorName", donor.donorName || "");
                    setValue("address", donor.address || "");
                    setValue("phone", donor.phone || "");

                    // ensure the select has this address option
                    const addr = (donor.address || "").trim();
                    if (addr) {
                        setAddressList(prev => (prev.includes(addr) ? prev : [addr, ...prev]));
                    }
                } else {
                    resetDonorFields(setValue);
                    toast.error("Donor not found");
                }
            } catch (err) {
                resetDonorFields(setValue);
                console.error("Donor lookup failed", err.message);
            }
        })();

        return () => { cancelled = true; };
    }, [donorIdValue, user?.email, axiosSecure, setValue, refetch]);


    // __________________________________________________________________________________________________________
    // Initial static values
    const [addressList, setAddressList] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [references, setReferences] = useState([]);

    useEffect(() => {
        setAddressList(address || []);
        setIncomeCategories(category || []);
        setUnitOptions(unit || []);
        setReferences(reference || []);
    }, [address, category, unit, reference]);


    useEffect(() => {
        if (!user?.email) return;
        (async () => {
            try {
                const res = await axiosSecure.get("/donationCategories", {
                    params: { email: user.email },
                });
                setUnitOptions(res?.data?.sortedUnit || []);
            } catch (err) {
                console.error("Unit fetch error:", err);
            }
        })();
    }, [axiosSecure, user?.email]);



    // ___________________________________________________________________________________________________________
    const [newField, setNewField] = useState({
        address: false,
        category: false,
        unit: false,
        reference: false,
    });
    // _________________________________________________________________________________________________________
    // const watchFields = {
    //     address: watch("address"),
    //     incomeCategory: watch("incomeCategory"),
    //     unit: watch("unit"),
    //     reference: watch("reference"),
    // };
    // _________________________________________________________________________________________________________
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
    // _________________________________________________________________________________________________________
    const onSubmit = async (data) => {
        const selectedDate = data.date || new Date();

        const fullData = {
            ...data,
            date: moment(selectedDate).format("DD.MMM.YYYY"),
            month: moment(selectedDate).format("MMMM"),
            year: moment(selectedDate).format("YYYY"),
        };

        try {
            const res = await axiosHook.post("/submitDonation", fullData);
            if (res?.data?.insertedId || res?.data?.acknowledged) {
                setRefetch((prev) => !prev); // Toggle refetch to update the data
                toast.success("ডোনেশন সফলভাবে যুক্ত হয়েছে!");
                reset();
            }
        } catch (err) {
            toast.error("সার্ভার ত্রুটি! আবার চেষ্টা করুন।", err.message);
        }
    };
    // _________________________________________________________________________________________________________


    return (
        <div className="px-2">
            <h2 className="text-xl font-bold mb-4">দাতার বিবরণ</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Date Selection */}
                <div>
                    <Controller
                        className="w-full border border-red-500"
                        control={control}
                        name="date"
                        defaultValue={new Date()}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <DatePicker
                                className="input input-bordered w-full"
                                placeholderText="তারিখ নির্বাচন করুন"
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                maxDate={new Date()}
                                // minDate={moment().subtract(6, "days").toDate()}
                                dateFormat="dd-MM-yyyy"
                            />
                        )}
                    />
                    {errors.date && (
                        <span className="text-red-500 text-sm">তারিখ নির্বাচন আবশ্যক</span>
                    )}
                </div>

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
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="নতুন ঠিকানা লিখুন"
                            className="input input-bordered w-full"
                            onBlur={(e) => handleAddNewOption("address", e.target.value)}
                            autoFocus
                        />
                        <button
                            type="button"
                            className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => setNewField((prev) => ({ ...prev, address: false }))}
                        >
                            বাতিল
                        </button>
                    </div>


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
                            onClick={() => setNewField((prev) => ({ ...prev, category: false }))}
                        >
                            বাতিল
                        </button>
                    </div>

                )}

                {/* Amount */}
                <input
                    type="text"
                    placeholder="টাকার পরিমান"
                    {...register("amount", {
                        // required: true,
                        pattern: /^\d+$/,
                    })}
                    className="input input-bordered w-full"
                />

                {/* Quantity */}
                <input
                    type="text"
                    placeholder="জিনিসের পরিমান"
                    {...register("quantity", {
                        // required: true,
                        pattern: /^\d+$/,
                    })}
                    className="input input-bordered w-full"
                />

                {/* Unit */}
                {!newField.unit ? (
                    <select
                        {...register("unit")}
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
                            onClick={() => setNewField((prev) => ({ ...prev, unit: false }))}
                        >
                            বাতিল
                        </button>
                    </div>
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
                            onClick={() => setNewField((prev) => ({ ...prev, reference: false }))}
                        >
                            বাতিল
                        </button>
                    </div>
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
