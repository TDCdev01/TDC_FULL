import { Book, Tv, Gamepad2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const offerItems = [
  {
    icon: Book,
    title: 'Hands-On Learning',
    description: 'Escape the digital world and immerse yourself in learning with our comprehensive physical materials, including textbooks, workbooks, and project guides.',
    bgColor: 'bg-[#f0f7ff]',
    iconColor: 'text-[#0066ff]'
  },
  {
    icon: Tv,
    title: 'Personalized Mentorship',
    description: 'Benefit from weekly calls with experienced mentors who will help you refine your skills, validate your ideas, and guide you toward a successful career.',
    bgColor: 'bg-[#fdf2ff]',
    iconColor: 'text-[#9333ea]'
  },
  {
    icon: Gamepad2,
    title: 'Accelerated Learning',
    description: 'Skip the setup and dive straight into coding with our pre-configured practice labs. Maximize your learning time and gain hands-on experience from day one.',
    bgColor: 'bg-[#f0fff4]',
    iconColor: 'text-[#22c55e]'
  },
  {
    icon: Building2,
    title: 'Interactive Live Classes',
    description: 'Experience focused learning with our interactive live classes. Get your questions answered instantly and accelerate your learning with real-time instructor support.',
    bgColor: 'bg-[#fff7ed]',
    iconColor: 'text-[#f97316]'
  }
];

const styles = {
  hamburgerMenu: {
    display: 'none',
    cursor: 'pointer',
    padding: '10px',
    zIndex: 100,
  },

  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },

  '@media screen and (max-width: 768px)': {
    navbar: {
      padding: '1rem',
    },
    
    hamburgerMenu: {
      display: 'block',
      position: 'absolute',
      right: '20px',
      top: '20px',
    },
    
    navLinks: {
      display: 'none',
      flexDirection: 'column',
      position: 'absolute',
      top: '60px',
      right: '0',
      backgroundColor: '#fff',
      width: '200px',
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      borderRadius: '4px',
    },
    
    navLinksActive: {
      display: 'flex',
    }
  },

  '@media screen and (max-width: 480px)': {
    navbar: {
      padding: '0.5rem',
    },
    
    navLinks: {
      width: '100%',
      top: '50px',
    }
  }
};

export default function TDCOffers() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <section className="py-16 bg-[#fcfcf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            What TDC offers you?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive learning solutions designed to accelerate your tech career
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {offerItems.map((item, index) => (
              <motion.div
                key={index}
                className={`${item.bgColor} rounded-xl p-6 h-[260px] flex flex-col justify-between hover:shadow-lg transition-shadow duration-300`}
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <div className={`${item.iconColor} mb-3`}>
                    <item.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
                <Link
                  to="#"
                  className="inline-flex items-center text-[#333333] font-medium hover:gap-2 transition-all duration-300 mt-2"
                >
                  Explore More 
                  <span className="ml-2">→</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="hidden lg:block lg:col-span-5">
            <div className="h-full w-full rounded-2xl overflow-hidden">
              <img
                src="https://res.cloudinary.com/dqt4zammn/image/upload/v1735478059/TDCoffers_s7c0vs.jpg"
                alt="Student with Laptop"
                className="w-full h-[540px] object-contain rounded-2xl"
                style={{
                  objectPosition: 'center',
                  backgroundColor: '#fcfcf8'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}