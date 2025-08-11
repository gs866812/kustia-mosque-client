import React, { useContext, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import ContextData from '../../ContextData';

const Footer = () => {
    const {hadith} = useContext(ContextData);
    const [hadithList, setHadithList] = useState([]);

    useEffect(() => {
        setHadithList(hadith);
    }, [hadith]);


    return (
        <div className="w-full bg-[#134834] text-white">
            <Swiper
                spaceBetween={10}
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
