import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ArrowRight, Check, Zap, Brain, Code, Database, Cloud, Users, Star, Sparkles, Play, ChevronDown, Mail, Phone, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRef, useState, useEffect } from 'react';
import demoVideo from '../assets/TDC.mp4';
import { API_URL } from '../config/config';
import toast from 'react-hot-toast';

export default function TDCLabs() {
  const targetRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [100, -100]),
    { stiffness: 100, damping: 30 }
  );

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Hands-on Practice",
      description: "Real-world projects and exercises to build practical skills",
      color: "bg-gradient-to-r from-purple-500 to-indigo-600"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Live Environments",
      description: "Pre-configured development environments for instant coding",
      color: "bg-gradient-to-r from-emerald-500 to-teal-600"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Build your own server",
      description: "Personalized learning paths and intelligent feedback",
      color: "bg-gradient-to-r from-orange-500 to-pink-600"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Host Cloud Solution",
      description: "Learn cloud technologies with actual cloud environments",
      color: "bg-gradient-to-r from-blue-500 to-cyan-600"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "₹1,499",
      duration: "per month",
      features: [
        "Access to basic lab environments",
        "5 practice projects",
        "Community support",
        "Basic learning paths"
      ]
    },
    {
      name: "Pro",
      price: "₹2,999",
      duration: "per month",
      features: [
        "All Basic features",
        "Unlimited lab environments",
        "20 advanced projects",
        "Priority support",
        "Advanced learning paths",
        "Certification preparation"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      duration: "per team",
      features: [
        "All Pro features",
        "Team collaboration",
        "Custom projects",
        "Dedicated support",
        "Custom learning paths",
        "Team analytics"
      ]
    }
  ];

  const videoRef = useRef(null);
  const videoSectionRef = useRef(null);
  const isVideoInView = useInView(videoSectionRef, { 
    once: false,
    amount: 0.3  // Reduced threshold - video will start playing when 30% visible
  });

  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/trial-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Request submitted successfully!');
        setFormData({ email: '', phone: '' });
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isVideoInView) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Video play error:", error);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoInView]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffde58]/10 via-white to-[#333333]/10" />
        
        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-[#ffde58]/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#333333]/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center -mx-4"
          >
            {/* Left Column */}
            <motion.div 
              variants={itemVariants}
              className="w-full lg:w-1/2 px-4"
            >
              <div className="mb-12 lg:mb-0 max-w-[570px]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#ffde58]/20 to-[#ffde58]/40 text-[#333333] mb-6"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">The Future of Learning</span>
                </motion.div>

                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#333333] mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Welcome to
                  <span className="bg-gradient-to-r from-[#333333] to-[#666666] text-transparent bg-clip-text"> TDC</span>
                  <span className="text-[#ffde58]">Labs</span>
                </motion.h1>

                <motion.p 
                  className="text-gray-600 text-xl mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Experience the next generation of hands-on learning in Data Science, 
                  Analytics, and Cloud Computing with our immersive virtual labs.
                </motion.p>

                <motion.div 
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-[#333333] to-[#444444] text-white rounded-lg font-medium flex items-center gap-2 hover:from-[#222222] hover:to-[#333333] transition-all duration-300"
                  >
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-[#ffde58] to-[#ffcd38] text-[#333333] rounded-lg font-medium hover:from-[#ffcd38] hover:to-[#ffbc18] transition-all duration-300"
                  >
                    Watch Demo
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Lab Interface Preview */}
            <motion.div 
              className="w-full lg:w-1/2 px-4"
              variants={itemVariants}
            >
              <motion.div 
                className="relative"
                style={{ scale }}
              >
                <motion.div
                  className="absolute -inset-0.5 bg-gradient-to-r from-[#ffde58] to-[#333333] rounded-2xl blur opacity-30"
                  animate={{
                    opacity: [0.3, 0.15, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="relative">
                  <img
                    src="https://res.cloudinary.com/dqt4zammn/image/upload/v1734429178/api5kfd3wfdkakatqsbn.jpg"
                    alt="TDC Labs Interface"
                    className="rounded-2xl shadow-2xl"
                  />
                  <motion.div
                    className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#ffde58]" />
                      <span className="font-medium text-[#333333]">1000+ Active Learners</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trial Server Request Form */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]" 
            style={{ backgroundSize: '30px 30px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Experience Our Development Environment
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Get early access to our trial server and start building your projects in a professional development environment.
              </p>
            </div>

            {/* Form Container */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                {/* Animated Border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt" />
                
                {/* Form Card */}
                <div className="relative bg-gray-900 border border-gray-800 rounded-xl p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your work email"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg 
                                   focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                   text-white placeholder-gray-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg 
                                   focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                   text-white placeholder-gray-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group overflow-hidden px-6 py-4 rounded-lg 
                               bg-gradient-to-r from-purple-600 to-blue-600
                               hover:from-purple-500 hover:to-blue-500
                               focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                               transition-all duration-200 disabled:opacity-70"
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 
                                    group-hover:opacity-50 transition-opacity duration-200" />
                      <div className="relative flex items-center justify-center">
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-white font-medium">Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">Request Trial Access</span>
                            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Additional Info */}
                    <div className="mt-4 text-center text-sm text-gray-500">
                      <p>By submitting, you agree to our{' '}
                        <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-3">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400">Secure Environment</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400">24/7 Access</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-3">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400">Community Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with Hover Effects */}
      <motion.section 
        className="py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
                className={`${feature.color} p-6 rounded-xl text-white transform transition-all duration-300`}
              >
                <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Immersive Product Showcase */}
      <motion.section 
        ref={videoSectionRef}
        className="py-32 relative overflow-hidden bg-black"
      >
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://your-tech-background-image.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            y
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            style={{ opacity, scale }}
            className="max-w-6xl mx-auto text-center text-white"
          >
            <motion.h2 
              className="text-5xl md:text-7xl font-bold mb-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Experience the Future
              <br />
              <span className="bg-gradient-to-r from-[#ffde58] to-[#ff8c37] text-transparent bg-clip-text">
                of Learning
              </span>
            </motion.h2>

            {/* Interactive Demo Preview */}
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl my-16"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src={demoVideo}
                  playsInline
                  loop
                  muted
                  preload="auto"
                />
              </div>
            </motion.div>

            {/* Floating Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
              {[
                { title: "Real-time Collaboration", value: "100+", suffix: "Users" },
                { title: "Interactive Sessions", value: "50+", suffix: "Daily" },
                { title: "Success Rate", value: "95", suffix: "%" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ffde58]/20 to-[#ff8c37]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-8 hover:transform hover:-translate-y-2 transition-all duration-300">
                    <h3 className="text-4xl font-bold mb-2">
                      {stat.value}
                      <span className="text-[#ffde58]">{stat.suffix}</span>
                    </h3>
                    <p className="text-gray-300">{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </motion.section>

      {/* Interactive Features Showcase */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-6">
                  Learn by Doing,
                  <br />
                  <span className="text-[#ffde58]">Master by Practice</span>
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Our interactive labs provide hands-on experience with real-world scenarios.
                  Practice makes perfect, and we make practice engaging.
                </p>
                
                {/* Interactive Feature List */}
                {[
                  "Live coding environments",
                  "Real-time feedback system",
                  "Industry-standard tools",
                  "Collaborative learning spaces"
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-3 mb-4"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#ffde58]/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#333333]" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Interactive Demo Interface */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#ffde58] to-[#ff8c37] opacity-20"
                    animate={{
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <img
                    src="https://res.cloudinary.com/dqt4zammn/image/upload/v1734429178/api5kfd3wfdkakatqsbn.jpg"
                    alt="TDC Labs Interface"
                    className="relative z-10 rounded-2xl"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it's helping learners */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6">
              Empowering Learners
            </h2>
            <p className="text-gray-600 text-lg">
              See how TDC Labs is transforming the way students learn and practice 
              data science and analytics skills.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-[#333333] text-white p-8 rounded-xl">
                <Users className="w-8 h-8 mb-4 text-[#ffde58]" />
                <h3 className="text-xl font-semibold mb-4">
                  Active Learning Community
                </h3>
                <p className="text-gray-300">
                  Join a community of learners, share experiences, and learn from peers.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-[#ffde58] p-8 rounded-xl">
                <Star className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-semibold mb-4">
                  Industry-Ready Skills
                </h3>
                <p className="text-gray-700">
                  Develop practical skills that align with industry requirements.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-[#333333] text-white p-8 rounded-xl">
                <Zap className="w-8 h-8 mb-4 text-[#ffde58]" />
                <h3 className="text-xl font-semibold mb-4">
                  Instant Feedback
                </h3>
                <p className="text-gray-300">
                  Get real-time feedback on your code and projects to improve faster.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6">
              Lab Pricing Plans
            </h2>
            <p className="text-gray-600 text-lg">
              Choose the plan that best fits your learning needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-[#ffde58]' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="bg-[#ffde58] text-[#333333] text-center py-2 font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#333333] mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#333333]">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {plan.duration}
                    </span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular 
                      ? 'bg-[#333333] text-white hover:bg-[#222222]'
                      : 'border-2 border-[#333333] text-[#c3c2c2] hover:bg-gray-50'
                  }`}>
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial Section */}
      <section className="py-20 bg-[#333333] text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Get Free Access to TDC Labs
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start your 15-day free trial today and experience the power of hands-on learning
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#ffde58] text-[#333333] rounded-lg font-medium inline-flex items-center gap-2 hover:bg-[#ffd025] transition-colors"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="mt-4 text-gray-400">
              No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 