import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, BookOpen, Download, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from '../config/config';
import './styles.css';

// Use dynamic imports for images
const images = import.meta.glob('../images/*.{png,jpg,jpeg,gif,webp,svg}');

export default function LatestCourses() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/courses`);
        console.log(response);
        const data = await response.json();
        console.log(response);  
        
        if (data.success) {
          const formattedCourses = data.courses.map(course => ({
            _id: course._id,
            title: course.title,
            description: course.description,
            level: course.level || 'Intermediate',
            instructor: {
              name: course.instructor?.name || 'John Doe',
              avatar: course.instructor?.image || "/default-avatar.png"
            },
            stats: {
              videos: course.videoCount || 56,
              exercises: course.exercises || 30,
              quizzes: course.quizCount || 15,
              downloads: course.downloads || 10
            },
            duration: course.duration || 4,
            enrolled: course.enrolledCount || 0,
            rating: course.rating || 4.9,
            reviews: course.reviews || 0,
            image: course.image
          }));
          
          setCourses(formattedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const nextSlide = () => {
    if (!isAnimating && courses.length > 0) {
      setIsAnimating(true);
      const maxSlides = Math.ceil(courses.length / 3);
      setCurrentSlide((prev) => (prev + 1) % maxSlides);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isAnimating && courses.length > 0) {
      setIsAnimating(true);
      const maxSlides = Math.ceil(courses.length / 3);
      setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  useEffect(() => {
    let timer;
    if (!loading && courses.length > 0) {
      timer = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(timer);
  }, [loading, courses.length]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const formatDuration = (months) => `${months} months`;

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Learn Tech from Latest Courses
          </h2>
          <p className="text-gray-600">
            Explore 175+ Premium Courses with New Course Additions every Month
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={currentSlide}>
            <motion.div
              key={currentSlide}
              custom={currentSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 100, damping: 50 },
                opacity: { duration: 0.5 }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {courses.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No courses available</p>
                </div>
              ) : (
                courses
                  .slice(currentSlide * 3, (currentSlide + 1) * 3)
                  .map((course, index) => (
                    <motion.div
                      key={course._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <Link to={`/courses/${course._id}`}>
                        <div className="relative">
                          {course.image ? (
                            <img
                              src={course.image}
                              alt={course.image.alt || course.title}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://res.cloudinary.com/dqt4zammn/image/upload/v1734429178/api5kfd3wfdkakatqsbn.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No Image Available</span>
                            </div>
                          )}
                          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-blue-600">
                            {course.level}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <img
                              src={course.instructor.avatar}
                              alt={course.instructor.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-sm text-gray-600">Instructor</p>
                              <p className="font-medium text-blue-600">{course.instructor.name}</p>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">{course.stats.videos} videos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">{course.stats.exercises} exercises</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">{course.stats.quizzes} quizzes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">{course.stats.downloads} downloads</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">{course.duration} months</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-blue-600">{course.enrolled}</span>
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium text-blue-600">{course.rating}</span>
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">{course.reviews}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
              )}
            </motion.div>
          </AnimatePresence>

          {courses.length > 3 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg text-gray-800 hover:bg-gray-50 focus:outline-none"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg text-gray-800 hover:bg-gray-50 focus:outline-none"
                onClick={nextSlide}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
