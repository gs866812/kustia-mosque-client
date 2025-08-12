import SubmitDonation from "../Admin/SubmitDonation";


const AddDonationModal = () => {
    return (
        <div>
            <section className='flex justify-end'>
                <button
                    onClick={() => document.getElementById('addNewDonation').showModal()}
                    className='px-3 py-2 text-white localBG mt-3 rounded-md cursor-pointer'>
                    নতুন যোগ করুন
                </button>
            </section>

            <dialog id="addNewDonation" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle bg-red-400 hover:bg-red-500 text-white absolute right-2 top-2">✕</button>
                    </form>
                    <SubmitDonation />
                </div>
            </dialog>
        </div>
    );
};

export default AddDonationModal;