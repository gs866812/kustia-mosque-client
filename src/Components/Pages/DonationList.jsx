import React, { useContext } from 'react';
import SubmitDonation from '../Admin/SubmitDonation';
import AddDonationModal from '../Modal/AddDonationModal';
import ContextData from '../../ContextData';

const DonationList = () => {
    const { donation } = useContext(ContextData);
    console.log(donation)
    return (
        <div>
            <section className='flex justify-end'>
                <AddDonationModal/>
            </section>
        </div>
    );
};

export default DonationList;