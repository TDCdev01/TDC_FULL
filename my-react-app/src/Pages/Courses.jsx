import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, Clock, Star, ChevronRight, PlayCircle, CheckCircle, 
  BookOpen, Video, Code, Download, Users, MessageCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/config';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Courses() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Courses', icon: BookOpen },
    { id: 'python', name: 'Python', icon: Code },
    { id: 'javascript', name: 'JavaScript', icon: Code },
    { id: 'data-science', name: 'Data Science', icon: Book },
    { id: 'machine-learning', name: 'Machine Learning', icon: Book }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 font-medium">Loading courses...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#333333] to-[#111827] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <h1 className="text-5xl font-bold text-center mb-6">
              Master Your Skills with Our Courses
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto text-gray-100 mb-8">
              Explore our comprehensive courses designed to take you from beginner to expert.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            {/* Category Filter */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4 text-[#111827]">Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-[#111827] text-white shadow-lg'
                          : 'bg-white text-[#333333] hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Filter */}
            <div className="md:w-64">
              <h3 className="text-lg font-semibold mb-4 text-[#111827]">Level</h3>
              <div className="flex flex-col gap-2">
                {levels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedLevel === level.id
                        ? 'bg-[#111827] text-white shadow-lg'
                        : 'bg-white text-[#333333] hover:bg-gray-100'
                    }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCourses.map(course => (
              <motion.div
                key={course._id}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 w-full"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <div className="relative h-44">
                  <img
                    src={course.image || '/default-course-image.jpg'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-[#111827]">
                    {course.level}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <img
                      src={course.instructor.image || '/default-avatar.jpg'}
                      alt={course.instructor.name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <p className="text-xs text-gray-600">Instructor</p>
                      <p className="font-medium text-[#111827] text-sm">{course.instructor.name}</p>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-[#111827] mb-2">
                    {course.title}
                  </h2>
                  <p className="text-[#333333] mb-4 text-sm line-clamp-2">
                    {course.description}
                  </p>

                  {/* Resources */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {course.resources.map((resource, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        {resource.type === 'video' && <Video className="w-3 h-3 mr-1" />}
                        {resource.type === 'exercise' && <Code className="w-3 h-3 mr-1" />}
                        {resource.type === 'quiz' && <BookOpen className="w-3 h-3 mr-1" />}
                        {resource.type === 'download' && <Download className="w-3 h-3 mr-1" />}
                        {resource.count} {resource.type}s
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  {course.progress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-[#333333]">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {course.students}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                        {course.rating}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {course.reviews}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
} 