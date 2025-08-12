import React from 'react';
import AddExpenseModal from '../Modal/AddExpenseModal';

const ExpenseList = () => {
    return (
        <div>
            <section className='flex justify-end'>
                <AddExpenseModal />
            </section>

            <section>
                {/* search, date range and filter section */}
            </section>

            <section>
                {/* Table data */}
            </section>

            <section>
                {/* edit expense modal */}
            </section>

            <section>
                {/* Pagination */}
            </section>
        </div>
    );
};

export default ExpenseList;