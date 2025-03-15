import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaLaptopCode, FaUserFriends, FaVideo, FaFlask, FaCode, FaRocket, FaAward, FaStar, FaQuoteLeft, FaAngleDown, FaAngleUp, FaBrain, FaShieldAlt, FaUserGraduate, FaClock, FaArrowRight } from 'react-icons/fa';
import { HiOutlineBadgeCheck, HiOutlineChartBar, HiOutlineClock } from 'react-icons/hi';
import Navbar from '../components/Navbar';

// Animated counter component for statistics
const CounterAnimation = ({ target, title, icon: Icon, bgColor, textColor }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const interval = setInterval(() => {
            setCount((prev) => {
              if (prev >= target) {
                clearInterval(interval);
                return target;
              }
              return prev + Math.ceil(target / 50);
            });
          }, 20);
          
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.1 }
    );
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [target]);
  
  return (
    <div ref={counterRef} className={`bg-${bgColor} rounded-lg p-6 text-center`}>
      <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
      <div className="text-4xl font-bold text-gray-800 mb-2">{count}+</div>
      <p className="text-gray-600">{title}</p>
    </div>
  );
};

const TestimonialCard = ({ name, role, image, quote }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl shadow-xl relative"
    >
      <FaQuoteLeft className="text-blue-600/20 text-4xl absolute top-4 right-4" />
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-blue-200">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="text-gray-800 font-semibold">{name}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-800/90 italic">"{quote}"</p>
      <div className="mt-3 flex">
        <FaStar className="text-blue-600 mr-1" />
        <FaStar className="text-blue-600 mr-1" />
        <FaStar className="text-blue-600 mr-1" />
        <FaStar className="text-blue-600 mr-1" />
        <FaStar className="text-blue-600" />
      </div>
    </motion.div>
  );
};

// Completely new Accordion component with light theme
const Accordion = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-2 bg-white border-0 overflow-hidden">
      <button
        className="w-full bg-white py-4 px-5 flex items-center justify-between text-left rounded-lg hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: '#333333' }}
      >
        <span className="font-medium text-lg text-gray-800">{title}</span>
        <span className="text-[#ffde58]">
          {isOpen ? <FaAngleUp size={20} /> : <FaAngleDown size={20} />}
        </span>
      </button>
      
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-white"
      >
        <div className="p-5 pt-0 text-gray-600 bg-white">
          {content}
        </div>
      </motion.div>
    </div>
  );
};

const PricingCard = ({ plan, price, icon: Icon, features, popular, startingFrom }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative p-8 rounded-2xl shadow-xl ${
        popular 
          ? 'bg-gradient-to-br from-[#333333] to-[#222222] text-white' 
          : 'bg-white border border-[#e5e7eb] text-[#333333]'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-[#ffde58] text-[#333333] text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <div className={`inline-block p-3 ${popular ? 'bg-[#ffde58]/20' : 'bg-[#ffde58]/10'} rounded-full mb-4`}>
          <Icon className={`w-8 h-8 ${popular ? 'text-[#ffde58]' : 'text-[#333333]'}`} />
        </div>
        <h3 className={`text-2xl font-bold ${popular ? 'text-white' : 'text-[#333333]'}`}>
          {plan}
        </h3>
      </div>
      <div className="text-center mb-6">
        <span className={`text-sm font-medium uppercase ${popular ? 'text-[#ffde58]' : 'text-[#666666]'}`}>
          {startingFrom ? 'Starting from' : ''}
        </span>
        <div className="mt-1">
          <span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-[#333333]'}`}>
            ₹{price}
          </span>
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <FaCheck className={`w-5 h-5 mr-3 ${popular ? 'text-[#ffde58]' : 'text-[#ffde58]'}`} />
            <span className={popular ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link to="/course">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            popular 
              ? 'bg-[#ffde58] text-[#333333] hover:bg-[#ffd025]' 
              : 'bg-[#333333] text-white hover:bg-[#222222]'
          }`}
        >
          Get Started
        </motion.button>
      </Link>
    </motion.div>
  );
};

const ParallaxSection = ({ children, offset = 50 }) => {
  return (
    <motion.div
      initial={{ y: offset }}
      whileInView={{ y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

const FloatingFeature = ({ icon: Icon, title }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center bg-gray-100 backdrop-blur-md p-3 rounded-full shadow-lg"
    >
      <div className="bg-blue-600 p-2 rounded-full mr-2">
        <Icon className="text-gray-800 w-4 h-4" />
      </div>
      <span className="text-gray-800 text-sm font-medium">{title}</span>
    </motion.div>
  );
};

export default function Pricing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  const pricingPlans = [
    {
      plan: "Self-Learning Courses",
      price: "5,000",
      icon: FaLaptopCode,
      startingFrom: true,
      features: [
        "Full access to course material",
        "Learn at your own pace",
        "Downloadable resources",
        "Completion certificate",
        "Lifetime access to content",
        "Community forum support"
      ],
      popular: false
    },
    {
      plan: "Mentored Courses",
      price: "10,000",
      icon: FaUserFriends,
      startingFrom: true,
      features: [
        "All Self-Learning features",
        "Weekly 1:1 mentorship calls",
        "Personalized learning path",
        "Project feedback and reviews",
        "Direct access to instructors",
        "Career guidance sessions"
      ],
      popular: true
    },
    {
      plan: "Live Courses",
      price: "20,000",
      icon: FaVideo,
      startingFrom: true,
      features: [
        "All Mentored Course features",
        "Live interactive classes",
        "Real-time doubt resolution",
        "Collaborative learning",
        "Industry-specific case studies",
        "Job placement assistance"
      ],
      popular: false
    }
  ];
  
  const faqs = [
    {
      title: "What's the difference between course formats?",
      content: "Self Learning offers flexible, self-paced access to course materials. Mentored Course includes 1-on-1 guidance and feedback. Live Course provides real-time interactive sessions with instructors and peers."
    },
    {
      title: "Do I get lifetime access to course materials?",
      content: "Yes, once you purchase a course, you get lifetime access to all course materials, updates, and improvements we make to the curriculum."
    },
    {
      title: "How do the mentorship sessions work?",
      content: "Mentorship sessions are 1-on-1 video calls with industry experts. You can schedule sessions at your convenience and discuss projects, career guidance, or specific technical challenges."
    },
    {
      title: "What happens if I miss a live class?",
      content: "All live classes are recorded and made available in your learning dashboard. You can watch them at your convenience and still participate in related assignments."
    },
    {
      title: "How does TDC Labs complement the courses?",
      content: "TDC Labs provides hands-on practice environments where you can apply concepts learned in courses. It includes real-world projects, coding environments, and interactive exercises."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      
      {/* Hero Section with Updated Background */}
      <div className="relative overflow-hidden">
        {/* Background with lighter overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'multiply'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#ffde58]/10 text-[#ffde58] mb-6"
            >
              <span className="text-sm font-medium">Transform Your Career with Top-Tier Education</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your
              <span className="text-[#ffde58]"> Learning Journey</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unlock your potential with our comprehensive learning formats
              tailored to your goals and learning style
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <FaAward className="text-[#ffde58]" />
                <span>Industry-Recognized Certifications</span>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <FaUserGraduate className="text-[#ffde58]" />
                <span>High Job Placement Rate</span>
              </motion.div>
              <motion.div 
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <FaClock className="text-[#ffde58]" />
                <span>Learn at Your Own Pace</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Floating Stats Banner */}
      <div className="relative z-10 -mt-10 mb-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-2xl p-8 md:py-6 md:px-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CounterAnimation target={1000} title="Active Students" icon={FaUserGraduate} bgColor="bg-blue-50" textColor="text-blue-600" />
              <CounterAnimation target={50} title="Expert Instructors" icon={FaUserFriends} bgColor="bg-blue-50" textColor="text-blue-600" />
              <CounterAnimation target={100} title="Courses Available" icon={FaLaptopCode} bgColor="bg-blue-50" textColor="text-blue-600" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards with enhanced animations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <ParallaxSection key={index} offset={100}>
              <PricingCard {...plan} />
            </ParallaxSection>
          ))}
        </div>
      </div>
      
      {/* What Sets Us Apart Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">OUR ADVANTAGE</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">What Sets Us Apart</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with expert instruction to provide an unmatched learning experience
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaAward className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Curriculum</h3>
              <p className="text-gray-600">
                Industry-reviewed content designed by experts to ensure relevant, up-to-date learning material
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaBrain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Adaptive Learning</h3>
              <p className="text-gray-600">
                Our platform adjusts to your learning pace and style, optimizing your educational journey
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaShieldAlt className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Career Support</h3>
              <p className="text-gray-600">
                Beyond learning, we provide networking opportunities and job placement assistance
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* TDC Labs Highlight Section with Enhanced Visuals */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Explore TDC Labs
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Get hands-on experience with our state-of-the-art virtual lab environment
            </p>
            <Link to="/lab">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#ffde58] text-[#333333] px-8 py-3 rounded-lg font-semibold hover:bg-[#ffd025] transition-all inline-flex items-center gap-2"
              >
                Get Started with Labs
                <FaArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaCode,
                title: "Interactive Coding",
                description: "Write, run, and debug code directly in your browser"
              },
              {
                icon: FaRocket,
                title: "Project-Based Learning",
                description: "Apply concepts in real-world scenarios"
              },
              {
                icon: FaUserFriends,
                title: "Collaborative Environment",
                description: "Share your work and learn with peers"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#222222] p-6 rounded-xl"
              >
                <div className="inline-block p-3 bg-[#ffde58]/10 rounded-full mb-4">
                  <feature.icon className="w-6 h-6 text-[#ffde58]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
                <Link to="/lab">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 text-[#ffde58] hover:text-[#ffd025] transition-all inline-flex items-center gap-1 text-sm font-medium"
                  >
                    Try Now <FaArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">TESTIMONIALS</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              Student Success Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear what our students have to say about their learning experience with us
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard 
              name="Rajesh Sharma"
              role="Data Engineer at Microsoft"
              image="https://res.cloudinary.com/dl4zkgesn/image/upload/v1741770328/rajesh_sharma_gb31a8.jpg"
              quote="The mentored course transformed my career. My mentor helped me build a portfolio that landed me my dream job at Microsoft."
            />
            <TestimonialCard 
              name="Priya Varma"
              role="Data Scientist"
              image="https://res.cloudinary.com/dl4zkgesn/image/upload/v1741770375/priya_varma_sf0nfv.jpg"
              quote="The interactive labs made complex data concepts click for me. I went from struggling with basics to implementing machine learning models in weeks."
            />
            <TestimonialCard 
              name="Pooja Malhotra"
              role="PowerBI Developer"
              image="https://res.cloudinary.com/dl4zkgesn/image/upload/v1741770461/neha_reddy_nlhiiq.jpg"
              quote="The live courses provided real-time feedback on my projects. The instructors weren't just teachers; they became mentors guiding my tech journey."
            />
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#ffde58]/10 text-[#333333] mb-6"
            >
              <span className="text-sm font-medium">Got Questions?</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our courses and learning experience
            </p>
          </motion.div>
          
          <div className="space-y-4 bg-white">
            {faqs.map((faq, index) => (
              <Accordion 
                key={index} 
                title={faq.title} 
                content={faq.content} 
              />
            ))}
          </div>

          {/* Additional Help Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600">
              Still have questions?{' '}
              <Link 
                to="/contact" 
                className="text-[#333333] font-semibold hover:text-[#ffde58] transition-colors"
              >
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#333333] to-[#222222]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-[#ffffff]/5 backdrop-blur-lg p-10 rounded-2xl"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-gray-300 mb-8">
              Join thousands of successful students who have transformed their careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#ffde58] text-[#333333] px-8 py-4 rounded-lg font-semibold hover:bg-[#ffd025] transition-all"
              >
                <Link to="/course">Explore Courses</Link>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-[#ffde58] text-[#ffde58] px-8 py-4 rounded-lg font-semibold hover:bg-[#ffde58]/10 transition-all"
              >
                <Link to="/lab">Try TDC Labs Free</Link>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 