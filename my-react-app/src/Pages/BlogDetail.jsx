import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import Navbar from '../components/Navbar';
import { API_URL } from '../config/config';

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const viewIncrementedRef = useRef(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        const response = await fetch(`${API_URL}/api/blog-posts/${id}`);
        const data = await response.json();

        if (data.success) {
          setPost(data.post);

          const viewKey = `blog_${id}_viewed_at`;
          const lastViewedAt = sessionStorage.getItem(viewKey);
          const now = new Date().toISOString();

          const incrementResponse = await fetch(`${API_URL}/api/blog-posts/${id}/increment-view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lastViewedAt })
          });

          const incrementData = await incrementResponse.json();
          if (incrementData.success) {
            sessionStorage.setItem(viewKey, now);
            setPost(prev => ({
              ...prev,
              views: incrementData.newCount
            }));
          }
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderSection = (section) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <ReactQuill
              value={section.content}
              readOnly={true}
              theme="bubble"
            />
          </div>
        );
      
      case 'code':
        return (
          <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
            <code>{section.content}</code>
          </pre>
        );
      
      case 'image':
        return (
          <figure className="my-8">
            <img
              src={section.content.url || section.content}
              alt={section.content.caption || "Blog image"}
              className="w-full rounded-lg shadow-lg"
            />
            {section.content.caption && (
              <figcaption className="mt-2 text-center text-sm text-gray-600">
                {section.content.caption}
              </figcaption>
            )}
          </figure>
        );
      
      case 'video':
        return (
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={section.content}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      
      case 'callToAction':
        return (
          <div className="my-8 flex justify-center">
            <a
              href={section.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {section.content.text}
            </a>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Blog post not found.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#333333] to-[#111827] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center text-gray-200 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to Blogs
            </button>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {post.title}
            </h1>

            <div className="flex items-center space-x-6 text-gray-200">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                {post.authorNameFE || 'Unknown Author'}
              </div>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              Views: {post.views || 0}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-12 prose prose-lg max-w-none">
              <div className="prose-headings:text-[#111827] prose-p:text-[#333333]">
                {post.sections.map((section, index) => (
                  <div key={index} className="blog-section">
                    {renderSection(section)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share and Navigation Section */}
          <div className="mt-12 flex justify-between items-center">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center text-[#333333] hover:text-[#111827] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to All Posts
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetail; 