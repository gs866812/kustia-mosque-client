import { useContext, useState } from 'react';
import AddHadithModal from '../Modal/AddHadithModal';
import ContextData from '../../ContextData';

const HadithList = () => {
    const {hadith} = useContext(ContextData);
    const [searchHadith, setSearchHadith] = useState("");
    console.log(hadith);
    return (
        <div className='px-5'>

            <section className='flex justify-between items-center'>
                <h2 className='text-2xl font-semibold'>হাদীস সমূহ</h2>
                <div className='flex gap-1 w-1/2 justify-end'>
                    <input
                        type="text"
                        placeholder="হাদিস খুঁজুন"
                        className="input input-bordered max-w-xs mt-3"
                        value={searchHadith}
                        onChange={(e) => setSearchHadith(e.target.value)}
                    />
                    <AddHadithModal />
                </div>
            </section>

            <section>
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full mt-5">
                        {/* head */}
                        <thead>
                            <tr className=''>
                                <th className='w-[8%]'>তারিখ</th>
                                <th className='text-center'>হাদিস লিস্ট</th>
                                <th className='w-[10%]'>অ্যাকশন</th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                hadith.filter(h => h.hadith.toLowerCase().includes(searchHadith.toLowerCase())).map((hadithItem, index) => (
                                    <tr key={index}>
                                        <td>{hadithItem.date}</td>
                                        <td className='text-center'>{hadithItem.hadith}</td>
                                        <td className='flex justify-center gap-2'>
                                            <button className='btn btn-sm bg-yellow-500'>সম্পাদনা</button>
                                            <button className='btn btn-sm bg-red-500 text-white'>মুছুন</button>
                                        </td>
                                    </tr>
                                ))
                            }
                            
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default HadithList;