import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Star, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Banner() {
  const stats = [
    { icon: <BookOpen className="w-6 h-6" />, value: '200+', label: 'Courses' },
    { icon: <Users className="w-6 h-6" />, value: '15K+', label: 'Students' },
    { icon: <Star className="w-6 h-6" />, value: '4.9', label: 'Rating' },
    { icon: <Award className="w-6 h-6" />, value: '100%', label: 'Satisfaction' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#374151] min-h-[600px]">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-400 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Master Modern Tech Skills
              <span className="text-yellow-400"> Online</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Learn from industry experts and advance your career with our comprehensive tech courses. Start your journey today!
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link 
                to="/courses" 
                className="inline-flex items-center px-8 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-full hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-500/30"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center px-8 py-3 bg-gray-700/50 text-white rounded-full hover:bg-gray-700/70 transition-all backdrop-blur-sm"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all"
                >
                  <div className="flex justify-center text-yellow-400 mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[500px]">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full opacity-5 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full opacity-5 blur-3xl"></div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 w-64 bg-gray-800 rounded-xl shadow-2xl p-4 transform rotate-6"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-white">Machine Learning</div>
                    <div className="text-xs text-gray-400">Machine Learning Course</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="w-3/4 h-full bg-yellow-500 rounded-full"></div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-10 w-64 bg-gray-800 rounded-xl shadow-2xl p-4 transform -rotate-3"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-white">Data Science</div>
                    <div className="text-xs text-gray-400">Advanced Analytics</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div className="w-1/2 h-full bg-blue-500 rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}