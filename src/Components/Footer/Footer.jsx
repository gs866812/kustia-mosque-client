import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const Footer = () => {
    const [hadithList, setHadithList] = useState([]);

    useEffect(() => {
        setHadithList([
            { hadithList: 'তোমরা পরস্পরকে সালাম দাও, খাবার খাওয়াও, আত্মীয়তার সম্পর্ক রাখো এবং রাতের বেলা নামাজ পড়ো।" (তিরমিযি' },
        ]);
    }, []);


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
                        <p className="text-[18px] py-2">{hadith.hadithList}</p>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Footer;
