import { useState, useEffect } from "react";
import './styles.css';

const banners = [
  {
    imgSrc: "https://res.cloudinary.com/dl4zkgesn/image/upload/c_crop,w_1920/v1739624253/Banner02_ecimmz.jpg",
    alt: "TopDataCoach Banner 1"
  },
  {
    imgSrc: "https://res.cloudinary.com/dl4zkgesn/image/upload/v1739624175/Banner01_musi3q.jpg",
    alt: "TopDataCoach Banner 2"
  }
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center w-full max-h-[600px] overflow-hidden">
      <div className="relative w-full h-[600px] flex-1">
        <img
          src={banners[currentIndex].imgSrc}
          alt={banners[currentIndex].alt}
          className="w-full h-full object-cover"
          style={{
            maxWidth: '100%',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}
