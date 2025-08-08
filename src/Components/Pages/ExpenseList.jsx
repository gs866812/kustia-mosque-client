import React from 'react';
import AddExpenseModal from '../Modal/AddExpenseModal';

const ExpenseList = () => {
    return (
        <div>
            <section className='flex justify-end'>
                <AddExpenseModal />
            </section>
        </div>
    );
};

export default ExpenseList;