import { API_URL } from '../../../config/config';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Image, Code, Type, Video, X, ArrowLeft, Edit2, Check, Link } from 'lucide-react';
import TextEditor from './TextEditor';
import CodeEditor from './CodeEditor';
import ImageUploader from './ImageUploader';
import VideoEmbed from './VideoEmbed';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import LoadingSpinner from '../../common/LoadingSpinner';

function CreateBlogPost() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [title, setTitle] = useState('Untitled Post');
  const [sections, setSections] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [bannerImage, setBannerImage] = useState({ url: '', alt: '' });
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [authorName, setAuthorName] = useState('');

  // Define available tags and topics
  const tags = ['Featured', 'New', 'Popular', 'Trending'];
  const topics = [
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
    const checkAuth = () => {
      console.log('Checking auth state:', authState);
      if (!authState.isAuthenticated || !authState.isAdmin) {
        console.log('User not authenticated or not admin');
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [authState, navigate]);

  const addSection = (type) => {
    setSections([...sections, { type, id: Date.now(), content: '' }]);
    setShowAddMenu(false);
  };

  const updateSection = (id, content) => {
    console.log('Updating section:', id, content);
    setSections(sections.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  const removeSection = (id) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const imageUrl = await uploadToCloudinary(file, 'image');
      setBannerImage({ url: imageUrl, alt: title || 'Blog banner' });
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner image. Please try again.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const validationErrors = [];
    
    if (!title.trim()) {
      validationErrors.push('Title is required');
    }

    if (!authorName.trim()) {
      validationErrors.push('Author name is required');
    }

    if (!bannerImage.url) {
      validationErrors.push('Banner image is required');
    }

    if (selectedTags.length === 0) {
      validationErrors.push('Please select at least one tag');
    }

    if (selectedTopics.length === 0) {
      validationErrors.push('Please select at least one topic');
    }

    if (sections.length === 0) {
      validationErrors.push('Please add at least one content section');
    }

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    try {
      console.log('Submitting blog post with data:', {
        title,
        authorName,
        bannerImage,
        sections,
        tags: selectedTags,
        topics: selectedTopics
      }); // Debug log

      const token = localStorage.getItem('adminToken');
      console.log('Using token:', token); // Debug log
      
      if (!token) {
        console.log('No admin token found');
        navigate('/admin/login');
        return;
      }

      // Process sections to ensure proper format for images
      const processedSections = sections.map(section => ({
        type: section.type,
        content: section.type === 'image' ? {
          url: section.content,
          caption: section.caption || ''
        } : section.content
      }));

      console.log('Sending request with token:', token);
      const response = await fetch(`${API_URL}/api/admin/blog-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          authorName: authorName.trim(),
          bannerImage,
          sections: processedSections,
          tags: selectedTags,
          topics: selectedTopics
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        alert('Blog post created successfully!');
        setTitle('');
        setSections([]);
        navigate('/admin/dashboard');
      } else {
        throw new Error(data.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert(error.message || 'Failed to create blog post. Please try again.');
    }
  };

  const handleTitleSave = () => {
    if (!title.trim()) {
      setTitle('Untitled Post');
    }
    setIsEditingTitle(false);
  };

  // Add Call to Action component
  const CallToAction = ({ value, onChange }) => {
    const [localText, setLocalText] = useState(value?.text || '');
    const [localUrl, setLocalUrl] = useState(value?.url || '');

    // Update parent only when input loses focus
    const handleBlur = () => {
      onChange({
        text: localText.trim(),
        url: localUrl.trim()
      });
    };

    return (
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter button text"
            className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <input
            type="url"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter button URL (e.g., https://example.com)"
            className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        {/* Preview */}
        {(localText || localUrl) && (
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Preview:</p>
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {localText || 'Button Text'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                form="blog-form"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm hover:shadow transition-all duration-200
                  ${(!bannerImage.url || !authorName.trim() || selectedTags.length === 0 || selectedTopics.length === 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : ''}`}
                disabled={!bannerImage.url || !authorName.trim() || selectedTags.length === 0 || selectedTopics.length === 0}
              >
                Publish Post
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form id="blog-form" onSubmit={handleSubmit} className="divide-y divide-gray-100">
            {/* Title Section */}
            <div className="p-8">
              <div className="flex items-center justify-between group">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                    autoFocus
                    className="w-full text-4xl font-bold text-gray-900 border-b-2 border-purple-500 focus:outline-none bg-gray-50 px-2 py-1 rounded"
                    placeholder="Enter your post title..."
                  />
                ) : (
                  <h2 
                    className="text-4xl font-bold text-gray-900 px-2 py-1"
                  >
                    {title}
                  </h2>
                )}
                <button
                  type="button"
                  onClick={() => isEditingTitle ? handleTitleSave() : setIsEditingTitle(true)}
                  className="ml-4 p-2 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {isEditingTitle ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Edit2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Author Name Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Author Name</h3>
                <span className="text-red-500 text-sm">*Required</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter author name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {!authorName.trim() && (
                  <p className="text-sm text-red-500">
                    Please enter the author name
                  </p>
                )}
              </div>
            </div>

            {/* Banner Image Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Blog Banner Image
                </h3>
                <span className="text-red-500 text-sm">*Required</span>
              </div>
              <div className="space-y-4">
                {bannerImage.url ? (
                  <div className="relative">
                    <img
                      src={bannerImage.url}
                      alt={bannerImage.alt}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setBannerImage({ url: '', alt: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <div className="flex flex-col items-center">
                      {uploadingBanner ? (
                        <div className="flex flex-col items-center space-y-2">
                          <LoadingSpinner size="small" />
                          <p className="text-sm text-gray-500">
                            Uploading banner...
                          </p>
                        </div>
                      ) : (
                        <>
                          <Image className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-4">
                            Upload a banner image for your blog
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                <span className="text-red-500 text-sm">*Required</span>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length === 0 && (
                  <p className="text-sm text-red-500">
                    Please select at least one tag
                  </p>
                )}
              </div>
            </div>

            {/* Topics Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Topics</h3>
                <span className="text-red-500 text-sm">*Required</span>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {topics.map(topic => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        setSelectedTopics(prev =>
                          prev.includes(topic)
                            ? prev.filter(t => t !== topic)
                            : [...prev, topic]
                        );
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${selectedTopics.includes(topic)
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                {selectedTopics.length === 0 && (
                  <p className="text-sm text-red-500">
                    Please select at least one topic
                  </p>
                )}
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-8 space-y-8">
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-200 transition-colors duration-200"
                >
                  <button
                    onClick={() => removeSection(section.id)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-white transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="mb-2 text-sm font-medium text-gray-500">
                    {section.type === 'text' && 'Text Content'}
                    {section.type === 'code' && 'Code Block'}
                    {section.type === 'image' && 'Image Upload'}
                    {section.type === 'video' && 'Video Embed'}
                    {section.type === 'callToAction' && 'Call to Action'}
                  </div>

                  {section.type === 'text' && (
                    <TextEditor
                      value={section.content}
                      onChange={(content) => updateSection(section.id, content)}
                    />
                  )}

                  {section.type === 'code' && (
                    <CodeEditor
                      value={section.content}
                      onChange={(content) => updateSection(section.id, content)}
                    />
                  )}

                  {section.type === 'image' && (
                    <div className="space-y-4">
                      <ImageUploader
                        value={section.content}
                        onChange={(imageUrl) => updateSection(section.id, imageUrl)}
                      />
                      <input
                        type="text"
                        placeholder="Add image caption (optional)"
                        value={section.caption || ''}
                        onChange={(e) => {
                          const updatedSections = sections.map(s => 
                            s.id === section.id 
                              ? { ...s, caption: e.target.value }
                              : s
                          );
                          setSections(updatedSections);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {section.type === 'video' && (
                    <VideoEmbed
                      value={section.content}
                      onChange={(content) => updateSection(section.id, content)}
                    />
                  )}

                  {section.type === 'callToAction' && (
                    <CallToAction
                      value={section.content}
                      onChange={(content) => updateSection(section.id, content)}
                    />
                  )}
                </motion.div>
              ))}

              {/* Add Section Button */}
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="flex items-center space-x-2 px-5 py-3 text-purple-600 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Content</span>
                </motion.button>

                {showAddMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-10"
                  >
                    {[
                      { type: 'text', icon: Type, label: 'Text Content', desc: 'Add formatted text content' },
                      { type: 'code', icon: Code, label: 'Code Block', desc: 'Add code with syntax highlighting' },
                      { type: 'image', icon: Image, label: 'Image Upload', desc: 'Upload and embed images' },
                      { type: 'video', icon: Video, label: 'Video Embed', desc: 'Embed video content' },
                      { type: 'callToAction', icon: Link, label: 'Call to Action', desc: 'Add a custom action button' },
                    ].map(({ type, icon: Icon, label, desc }) => (
                      <motion.button
                        key={type}
                        type="button"
                        onClick={() => addSection(type)}
                        whileHover={{ x: 4 }}
                        className="flex items-start space-x-3 w-full p-3 hover:bg-purple-50 rounded-lg text-gray-700 transition-colors duration-200"
                      >
                        <Icon className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-gray-500">{desc}</div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-6 border-t border-gray-200">
              <button
                type="submit"
                className={`w-full px-6 py-3 text-white font-medium rounded-lg transition-all duration-200
                  ${(!bannerImage.url || !authorName.trim() || selectedTags.length === 0 || selectedTopics.length === 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={!bannerImage.url || !authorName.trim() || selectedTags.length === 0 || selectedTopics.length === 0}
              >
                Publish Blog Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateBlogPost; 