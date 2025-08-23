import { useContext } from 'react';
import { Link } from 'react-router-dom';
import ContextData from '../../ContextData';


const Header = () => {
    const { user, handleLogout } = useContext(ContextData);
    return (
        <div className='w-full localBG'>
            <div className=' text-white flex justify-center items-center  mx-auto relative'>
                <Link to='/' className='font-poppins font-bold lg:text-3xl py-2 text-xl'>
                    চিথলিয়া কেন্দ্রীয় জামে মসজিদ
                </Link>

                <section className='absolute right-5 top-4 flex items-center'>
                    {
                        user?.email ? (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="cursor-pointer">
                                    <div className='flex flex-col space-y-2 items-end'>
                                        <hr className='border-2 border-white w-8' />
                                        <hr className='border-2 border-white w-5' />
                                        <hr className='border-2 border-white w-8' />
                                    </div>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content border-2 border-gray-300 rounded-box z-1 mt-5 w-52 p-2 shadow bg-white">
                                    <li className='hover:bg-[#134834] rounded-md py-1 font-semibold text-[#134834] hover:text-white'>
                                        <Link to='/donation'>Donation</Link>
                                    </li>
                                    <li className='hover:bg-[#134834] rounded-md py-1 font-semibold text-[#134834] hover:text-white'>
                                        <Link to='/expense'>Expense</Link>
                                    </li>
                                    <li className='hover:bg-[#134834] rounded-md py-1 font-semibold text-[#134834] hover:text-white'>
                                        <Link to='/donorList'>Donor list</Link>
                                    </li>
                                    <li className='hover:bg-[#134834] rounded-md py-1 font-semibold text-[#134834] hover:text-white'>
                                        <Link to='/editData'>Edit info</Link>
                                    </li>
                                    <li className='hover:bg-[#134834] rounded-md py-1 font-semibold text-[#134834] hover:text-white'>
                                        <Link to='/hadith'>Hadith</Link>
                                    </li>

                                    <li className='hover:bg-[#134834] rounded-md py-1 font-semibold text-[#134834] hover:text-white'>
                                        <Link onClick={handleLogout}>Logout</Link>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to='/login' className='text-lg font-semibold'>Login</Link>
                        )
                    }

                </section>
            </div>
        </div>
    );
};

export default Header;