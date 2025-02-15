import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, BookOpen, Award, Brain, Laptop } from 'lucide-react';

export default function LearnPracticeSection() {
  const [activeTab, setActiveTab] = useState('Analyst');

  const tabs = [
    { id: 'Analyst', label: 'Analyst' },
    { id: 'Transitioner', label: 'Transitioner' },
    { id: 'Specialist', label: 'Specialist' },
    { id: 'Executive', label: 'Executive' },
  ];

  const content = {
    Analyst: {
      title: "Analyst",
      description: "Lacks practical skills for entry-level jobs. Solution: TopDataCoach's recorded courses and mentorship build a portfolio and provide job-ready skills.",
      image: "https://res.cloudinary.com/dqt4zammn/image/upload/v1734429178/api5kfd3wfdkakatqsbn.jpg",
      icon: <Code className="w-6 h-6" />,
      buttonText: "Explore Analyst"
    },
    Transitioner: {
      title: "Transitioner",
      description: "Can't demonstrate proficiency to employers. Solution: TopDataCoach's mentor courses and internships offer real-world project experience and personalized feedback.",
      image: "https://res.cloudinary.com/dqt4zammn/image/upload/v1734429178/api5kfd3wfdkakatqsbn.jpg",
      icon: <Laptop className="w-6 h-6" />,
      buttonText: "Start Transitioner"
    },
    Specialist: {
      title: "Specialist",
      description: "Needs to upskill for career advancement. Solution: TopDataCoach's specialized architecture and domain courses enhance expertise and open new opportunities.",
      image: "https://res.cloudinary.com/dqt4zammn/image/upload/v1734429178/api5kfd3wfdkakatqsbn.jpg",
      icon: <Terminal className="w-6 h-6" />,
      buttonText: "Practice Specialist"
    },
    Executive: {
      title: "Specialist",
      description: "Requires data literacy for strategic decisions. Solution: TopDataCoach's mentorship program develops leadership and data skills through non-profit projects.",
      image: "https://res.cloudinary.com/dqt4zammn/image/upload/v1734429178/api5kfd3wfdkakatqsbn.jpg",
      icon: <Terminal className="w-6 h-6" />,
      buttonText: "Practice Specialist"
    },
    // Add content for other tabs...
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-gray-900 mb-8"
        >
          Learn. Practice. Earn. Have Fun!
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-[#333333] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {content[activeTab] && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  {content[activeTab].icon}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {content[activeTab].title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  {content[activeTab].description}
                </p>
                <button className="px-6 py-3 bg-[#333333] text-white rounded-md hover:bg-gray-700 transition-colors">
                  {content[activeTab].buttonText}
                </button>
              </div>

              <motion.div 
                className="order-1 md:order-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={content[activeTab].image}
                  alt={content[activeTab].title}
                  className="w-full rounded-lg shadow-lg"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
} 