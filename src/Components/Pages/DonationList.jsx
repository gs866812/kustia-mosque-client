import React from 'react';
import SubmitDonation from '../Admin/SubmitDonation';
import AddDonationModal from '../Modal/AddDonationModal';

const DonationList = () => {
    return (
        <div>
            <section className='flex justify-end'>
                <AddDonationModal/>
            </section>
        </div>
    );
};

export default DonationList;