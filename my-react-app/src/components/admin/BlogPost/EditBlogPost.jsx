import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactQuill from 'react-quill';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '../layout/AdminLayout';
import { API_URL } from '../../../config/config';

export default function EditBlogPost() {
  const [originalPost, setOriginalPost] = useState(null);
  const [editedPost, setEditedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}`);
      const data = await response.json();
      if (data.success) {
        setOriginalPost(data.post);
        setEditedPost(data.post); // Create a copy for editing
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionContentChange = (sectionId, newContent) => {
    setEditedPost(prevPost => ({
      ...prevPost,
      sections: prevPost.sections.map(section =>
        section._id === sectionId
          ? { ...section, content: newContent }
          : section
      )
    }));
  };

  const handleSaveSection = async (sectionId) => {
    try {
      const section = editedPost.sections.find(s => s._id === sectionId);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          content: section.content,
          type: section.type
        })
      });

      const data = await response.json();
      if (data.success) {
        setOriginalPost(data.post);
        alert('Section saved successfully!');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEditedPost(prevPost => ({
          ...prevPost,
          sections: prevPost.sections.filter(section => section._id !== sectionId)
        }));
        setOriginalPost(data.post);
        alert('Section deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const renderSection = (section, index) => {
    const hasChanges = originalPost.sections.find(s => 
      s._id === section._id && s.content !== section.content
    );

    const sectionControls = (
      <div className="flex justify-end space-x-2 mb-2">
        {hasChanges && (
          <button
            onClick={() => handleSaveSection(section._id)}
            className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </button>
        )}
        <button
          onClick={() => handleDeleteSection(section._id)}
          className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
    );

    switch (section.type) {
      case 'text':
        return (
          <div key={section._id} className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Text Section {index + 1}</h3>
            {sectionControls}
            <ReactQuill
              theme="snow"
              value={section.content}
              onChange={(content) => handleSectionContentChange(section._id, content)}
              className="bg-white text-gray-900 rounded-lg"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'code-block'],
                  ['clean']
                ]
              }}
            />
          </div>
        );
      case 'code':
        return (
          <div key={section._id} className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Code Section {index + 1}</h3>
            {sectionControls}
            <div className="h-[400px] border border-gray-600 rounded-lg overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={section.content}
                onChange={(value) => handleSectionContentChange(section._id, value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on'
                }}
              />
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={section._id} className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Image Section {index + 1}</h3>
            {sectionControls}
            <input
              type="text"
              value={section.content}
              onChange={(e) => handleSectionContentChange(section._id, e.target.value)}
              className="w-full p-2 bg-white text-gray-900 rounded-lg border border-gray-300"
              placeholder="Image URL"
            />
            {section.content && (
              <img
                src={section.content}
                alt="Preview"
                className="mt-2 max-w-full h-auto rounded-lg"
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!editedPost) {
    return (
      <AdminLayout>
        <div className="text-center text-white">
          Post not found
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin/posts')}
            className="flex items-center mb-6 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Posts
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Edit Blog Post</h1>
            <input
              type="text"
              value={editedPost.title}
              onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
              className="w-full p-3 bg-white text-gray-900 rounded-lg border border-gray-300"
            />
          </div>

          <div className="space-y-8">
            {editedPost.sections.map((section, index) => renderSection(section, index))}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => navigate('/admin/posts')}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 