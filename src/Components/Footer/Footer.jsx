import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const Footer = () => {
    const hadithList = [
        {
            hadithList:
                'আল্লাহর রাসূল (সা.) বলেছেন, “যে ব্যক্তি আমার উম্মতের মধ্যে ভালো কিছু প্রচার করবে, তার জন্য সে কাজের সমপরিমাণ সওয়াব হবে এবং যারা তা করবে তাদের সওয়াবের সমপরিমাণ সওয়াবও তার জন্য হবে। আর যে ব্যক্তি আমার উম্মতের মধ্যে মন্দ কিছু প্রচার করবে, তার জন্য সে কাজের সমপরিমাণ গুনাহ হবে এবং যারা তা করবে তাদের গুনাহের সমপরিমাণ গুনাহও তার জন্য হবে।” (সহীহ মুসলিম, হাদীস: ২৬৭৪)',
        },
        {
            hadithList:
                'আল্লাহর রাসূল (সা.) বলেছেন, “যে ব্যক্তি আল্লাহর জন্য কোনো ভালো কাজ করবে, তার জন্য দশ থেকে সাতশ গুণ পর্যন্ত সওয়াব লেখা হবে। আর যে ব্যক্তি আল্লাহর জন্য কোনো মন্দ কাজ করবে, তার জন্য একটিই গুনাহ লেখা হবে।” (সহীহ বুখারী, হাদীস: ৭৫৭৭)',
        },
    ];

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
