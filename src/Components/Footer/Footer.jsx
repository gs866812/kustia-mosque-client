import React, { useContext, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import ContextData from '../../ContextData';
import useAxiosSecure from '../../utils/useAxiosSecure';
import toast from 'react-hot-toast';


const Footer = () => {
    const { refetch, user } = useContext(ContextData);
    const [hadithList, setHadithList] = useState([]);


    const axiosSecure = useAxiosSecure();


    useEffect(() => {
        if (!user?.email) return;
        const fetchFullHadith = async () => {
            try {
                const res = await axiosSecure.get(`/getFullHadithList`, {
                    params: {
                        email: user?.email,
                    }
                });

                if (res?.data) {
                    setHadithList(res.data);
                } else {
                    toast.error("No hadith data found");
                }
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchFullHadith();
    }, [refetch, axiosSecure, user?.email]);


    return (
        <div className="w-full bg-[#134834] text-white">
            <Swiper
                spaceBetween={10}
                slidesPerView={1}
                slidesPerGroup={1}
                centeredSlides={true}
                loop={true}
                speed={10000}
                autoplay={{
                    delay: 10000,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay]}
                className="text-center"
            >
                {hadithList.map((hadith, idx) => (
                    <SwiperSlide key={idx}>
                        <p className="text-[18px] py-2">{hadith.hadith}</p>
                    </SwiperSlide>
                ))}
            </Swiper>

        </div>
    );
};

export default Footer;
