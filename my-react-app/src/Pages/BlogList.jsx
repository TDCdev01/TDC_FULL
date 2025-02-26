import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config/config';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    tag: 'all',
    topic: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9); // 1 featured + 2 secondary + 6 regular posts

  const tags = ['all', 'Featured', 'New', 'Popular', 'Trending'];
  const topics = [
    'all',
    'Power BI',
    'Python',
    'Data Science',
    'Machine Learning',
    'SQL',
    'Data Analytics',
    'NumPy',
    'Pandas',
    'Azure',
    'AWS',
    'Database',
    'Big Data',
    'Data Engineering',
    'Data Visualization'
  ];

  useEffect(() => {
  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog-posts`);
      const data = await response.json();
      if (data.success) {
        setBlogs(data.posts);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesTag = activeFilters.tag === 'all' || blog.tags?.includes(activeFilters.tag);
    const matchesTopic = activeFilters.topic === 'all' || blog.topics?.includes(activeFilters.topic);
    return matchesTag && matchesTopic;
  });

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredBlogs.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBlogImage = (blog) => {
    console.log('Blog data:', blog); // Debug log

    // First try to get banner image
    if (blog.bannerImage) {
      console.log('Banner image found:', blog.bannerImage); // Debug log
      return blog.bannerImage.url;
    }
    
    // If no banner, try to find first image section
    if (blog.sections && Array.isArray(blog.sections)) {
      const imageSection = blog.sections.find(section => 
        section.type === 'image' && section.content
      );
      
      if (imageSection) {
        console.log('Image section found:', imageSection); // Debug log
        if (typeof imageSection.content === 'object') {
          return imageSection.content.url;
        }
        return imageSection.content;
      }
    }
    
    // Fallback to placeholder
    return 'https://via.placeholder.com/800x600/333333/FFFFFF?text=No+Image';
  };

  const clearFilters = () => {
    setActiveFilters({ tag: 'all', topic: 'all' });
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 mt-12">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors duration-200 
            ${currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {[...Array(totalPages)].map((_, idx) => {
          const pageNumber = idx + 1;
          // Show first page, last page, current page, and one page before and after current
          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`px-4 py-2 rounded-lg transition-all duration-200
                  ${currentPage === pageNumber
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {pageNumber}
              </button>
            );
          } else if (
            pageNumber === currentPage - 2 ||
            pageNumber === currentPage + 2
          ) {
            return <span key={pageNumber} className="px-2">...</span>;
          }
          return null;
        })}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors duration-200 
            ${currentPage === totalPages 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#333333] to-[#111827] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <h1 className="text-5xl font-bold text-center mb-6">
              TDC Blog
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto text-gray-300">
              Latest insights and tutorials from our data experts
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                </div>
                {(activeFilters.tag !== 'all' || activeFilters.topic !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>

              {/* Tags Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveFilters(prev => ({ ...prev, tag }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${activeFilters.tag === tag 
                          ? 'bg-blue-600 text-white shadow-md scale-105' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {tag === 'all' ? 'All Tags' : tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setActiveFilters(prev => ({ ...prev, topic }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${activeFilters.topic === topic 
                          ? 'bg-blue-600 text-white shadow-md scale-105' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {topic === 'all' ? 'All Topics' : topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Display */}
              {(activeFilters.tag !== 'all' || activeFilters.topic !== 'all') && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">Active filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.tag !== 'all' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {activeFilters.tag}
                        </span>
                      )}
                      {activeFilters.topic !== 'all' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {activeFilters.topic}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-gray-600">
            Showing {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, filteredBlogs.length)} of {filteredBlogs.length} posts
        </div>

          {/* Blog Posts Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {/* Featured Blog Grid */}
            <div className="grid grid-cols-12 gap-6 mb-12">
              {/* Large Featured Post */}
              {currentPosts[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-12 md:col-span-8 cursor-pointer"
                  onClick={() => navigate(`/blog/${currentPosts[0]._id}`)}
                >
                  <div className="relative h-[600px] rounded-xl overflow-hidden group">
                    <img
                      src={getBlogImage(currentPosts[0])}
                      alt={currentPosts[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="absolute bottom-0 p-8">
                        {/* Display tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {currentPosts[0].tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                              {tag}
                            </span>
                          ))}
                          {currentPosts[0].topics?.map(topic => (
                            <span key={topic} className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                          <span className="bg-blue-600 px-3 py-1 rounded-full">Featured</span>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(currentPosts[0].createdAt)}
                          </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                          {currentPosts[0].title}
                        </h2>
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {currentPosts[0].description}
                        </p>
                        <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                          <span className="text-gray-300">{currentPosts[0].authorNameFE|| 'Admin'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Secondary Featured Posts */}
              <div className="col-span-12 md:col-span-4 space-y-6">
                {currentPosts.slice(1, 3).map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate(`/blog/${blog._id}`)}
                  >
                    <div className="relative h-48">
                      <img
                        src={getBlogImage(blog)}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                        </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <Tag className="w-4 h-4" />
                        <span>{blog.category || 'Technology'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {blog.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(blog.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {blog.authorNameFE || 'Unknown Author'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Regular Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentPosts.slice(3).map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate(`/blog/${blog._id}`)}
                >
                  <div className="relative h-48">
                    <img
                      src={getBlogImage(blog)}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {blog.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {blog.authorNameFE || 'Unknown Author'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

            {/* Pagination */}
            <Pagination />
            </div>
        </div>
      </div>
    </>
  );
} 