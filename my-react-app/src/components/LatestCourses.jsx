import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Clock, Users, Bookmark } from 'lucide-react';
import { API_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';

export default function LatestCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const [width, setWidth] = useState(0);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/courses`);
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Calculate carousel width for smooth animations
  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [courses]);

  // Responsive settings
  const getCardsToShow = () => {
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [cardsToShow, setCardsToShow] = useState(getCardsToShow());
  const [cardWidth, setCardWidth] = useState(100 / cardsToShow);

  useEffect(() => {
    const handleResize = () => {
      const newCardsToShow = getCardsToShow();
      setCardsToShow(newCardsToShow);
      setCardWidth(100 / newCardsToShow);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, courses.length - cardsToShow);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const handleNext = () => {
    if (canScrollRight) setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    if (canScrollLeft) setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading latest courses...</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Courses</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our newest courses designed to help you master skills and advance your career.
          </p>
        </div>
        
        <div className="relative max-w-[1400px] mx-auto px-4">
          {/* Navigation Buttons */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={handlePrev}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:scale-105 transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onClick={handleNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:scale-105 transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Carousel Container */}
          <div className="overflow-hidden">
            <motion.div
              ref={carouselRef}
              className="flex"
              initial={{ x: 0 }}
              animate={{ x: `-${currentIndex * cardWidth}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  className={`flex-none`}
                  style={{ width: `${cardWidth}%`, padding: '0 12px' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div 
                    onClick={() => handleCourseClick(course._id)}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer h-full transition-all duration-300"
                  >
                    <div className="h-48 bg-blue-100 relative overflow-hidden">
                      {course.image ? (
                        <motion.img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                          <h3 className="text-2xl font-bold text-white">{course.title.substring(0, 1)}</h3>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg px-3 py-1 text-sm font-medium text-blue-600 flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {course.rating || "4.5"}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {course.category || "Development"}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {course.level || "Beginner"}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration || "8 weeks"}</span>
                        <span className="mx-2">•</span>
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.students || 0} students</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
                            {course.instructor && course.instructor.image ? (
                              <img 
                                src={course.instructor.image} 
                                alt={course.instructor.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {course.instructor ? course.instructor.name.charAt(0) : "T"}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {course.instructor ? course.instructor.name : "TDC"}
                          </span>
                        </div>
                        <motion.button 
                          className="text-blue-600 hover:text-blue-700"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Bookmark className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          
        </div>
      </div>
    </section>
  );
}
