import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../config/config';

const BlogPost = () => {
  const { id } = useParams(); // Get the blog post ID from URL
  const [post, setPost] = useState(null);

  const incrementViewCount = async (postId) => {
    try {
      console.log('[Frontend] Attempting to increment view count for post:', postId);
      
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('[Frontend] View count update response:', data);

      if (!response.ok) {
        throw new Error('Failed to increment view count');
      }
    } catch (error) {
      console.error('[Frontend] Error incrementing view count:', error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('[Frontend] Fetching post with ID:', id);
        const response = await fetch(`${API_URL}/api/blog-posts/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setPost(data.post);
          console.log('[Frontend] Post fetched, now incrementing view');
          await incrementViewCount(id);
        }
      } catch (error) {
        console.error('[Frontend] Error:', error);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      {/* Rest of your blog post display code */}
    </div>
  );
};

export default BlogPost; 