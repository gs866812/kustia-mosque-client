import React from 'react';
import SubmitExpense from '../Admin/SubmitExpense';

const AddExpenseModal = () => {
    return (
        <div>
            <section className='flex justify-end'>
                <button
                    onClick={() => document.getElementById('addNewExpense').showModal()}
                    className='px-3 py-2 text-white localBG mt-3 rounded-md cursor-pointer mr-5'>
                    নতুন যোগ করুন
                </button>
            </section>

            <dialog id="addNewExpense" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2">✕</button>
                    </form>
                    <SubmitExpense />
                </div>
            </dialog>
        </div>
    );
};

export default AddExpenseModal;