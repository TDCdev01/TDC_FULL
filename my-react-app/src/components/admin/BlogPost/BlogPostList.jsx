import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import Modal from '../../common/Modal';
import { API_URL } from '../../../config/config';

export default function BlogPostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ show: false, postId: null });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/api/blog-posts`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      console.log('[BlogPostList] Fetched posts:', data.posts.map(post => ({
        id: post._id,
        title: post.title,
        author: post.author,
        authorName: post.authorName
      })));
      
      if (data.success) {
        setPosts(data.posts);
      } else {
        throw new Error(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('[BlogPostList] Error fetching posts:', error);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (postId) => {
    setDeleteModal({ show: true, postId });
  };

  const handleDeleteConfirm = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/blog-posts/${deleteModal.postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prev => prev.filter(post => post._id !== deleteModal.postId));
        setDeleteModal({ show: false, postId: null });
        setSuccessModal({ show: true, message: 'Blog post deleted successfully' });
      } else {
        throw new Error(data.message || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      setSuccessModal({ show: true, message: `Failed to delete blog post: ${error.message}` });
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
            <button
              onClick={() => navigate('/admin/create-post')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Post
            </button>
          </div>

          <div className="text-white mb-4">
            Total Posts: {posts.length}
          </div>

          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {post.author?.name || post.authorName || 'Unknown Author'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {post.viewCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/admin/posts/${post._id}`)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edit-post/${post._id}`)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(post._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {posts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No blog posts found</p>
              <button
                onClick={() => navigate('/admin/create-post')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, postId: null })}
        title="Confirm Delete"
      >
        <div className="text-gray-300">
          <p className="mb-4">Are you sure you want to delete this blog post? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal({ show: false, postId: null })}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Success/Error Modal */}
      <Modal
        isOpen={successModal.show}
        onClose={() => setSuccessModal({ show: false, message: '' })}
        title="Notification"
      >
        <div className="text-gray-300">
          <p className="mb-4">{successModal.message}</p>
          <div className="flex justify-end">
            <button
              onClick={() => setSuccessModal({ show: false, message: '' })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
} 