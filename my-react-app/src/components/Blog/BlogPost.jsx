import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../config/config';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Separate function to fetch post data
  const fetchPost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  };

  // Separate function to increment view count
  const incrementViewCount = async (postId) => {
    console.log("Increment called")
    try {
      console.log(postId);
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId }) // Send postId in body
      });

      if (!response.ok) throw new Error('Failed to increment view');
      return await response.json();
    } catch (error) {
      console.error('Error incrementing view:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      console.log("Load post called")
      setLoading(true);
      try {
        // First fetch the post
        const postData = await fetchPost(id);
        if (!postData?.success) {
          throw new Error('Failed to fetch post');
        }
        
        // Set initial post data
        setPost(postData.post);

        // Then increment the view count
        const viewData = await incrementViewCount(id);
        if (viewData?.success) {
          // Update post with new view count
          setPost(prev => ({
            ...prev,
            views: viewData.post.views
          }));
        }
      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center p-4">Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        Views: {post.views || 0}
      </div>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
};

export default BlogPost; 