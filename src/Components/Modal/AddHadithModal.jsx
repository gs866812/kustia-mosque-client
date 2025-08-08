import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAxiosHook from "../../utils/useAxiosHook"; // adjust if needed
import ContextData from "../../ContextData";

const AddHadithModal = () => {
    const { setRefetch } = useContext(ContextData);
    const axiosHook = useAxiosHook();
    // __________________________________________________________________________
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: { hadith: "" },
        mode: "onChange",
    });
    // __________________________________________________________________________
    const onSubmit = async (data) => {
        try {
            const res = await axiosHook.post("/addHadith", data);
            if (res?.data?.insertedId || res?.data?.acknowledged) {
                toast.success("হাদিস সফলভাবে যোগ হয়েছে!");
                reset();
                document.getElementById("addNewHadith").close();
                setRefetch((prev) => !prev);
            } else {
                toast.error("হাদিস যোগ করতে ব্যর্থ হয়েছে।");
            }
        } catch (err) {
            console.error(err);
            toast.error("সার্ভার ত্রুটি, আবার চেষ্টা করুন।");
        }
    };
    // __________________________________________________________________________
    return (
        <div>
            <section className="flex justify-end">
                <button
                    onClick={() =>
                        document.getElementById("addNewHadith").showModal()
                    }
                    className="px-3 py-2 text-white localBG mt-3 rounded-md cursor-pointer mr-5"
                >
                    নতুন যোগ করুন
                </button>
            </section>

            <dialog id="addNewHadith" className="modal">
                <div className="modal-box">
                    {/* Close modal */}
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2">
                            ✕
                        </button>
                    </form>

                    {/* Form */}
                    <h3 className="text-lg font-bold mb-4 text-center">হাদিস যোগ করুন</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <textarea
                                placeholder="এখানে হাদিস লিখুন"
                                className="textarea textarea-bordered w-full"
                                {...register("hadith", {
                                     required: "হাদিস আবশ্যক",
                                     maxLength: {
                                        value: 150,
                                        message: "হাদিস 150 অক্ষরের বেশি হতে পারবে না",
                                     }
                                    })}
                            />
                            {errors.hadith && (
                                <span className="text-red-500 text-sm">
                                    {errors.hadith.message}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="btn btn-warning"
                            >
                                রিসেট
                            </button>
                            <button type="submit" className="btn localBG text-white">
                                সাবমিট
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default AddHadithModal;
