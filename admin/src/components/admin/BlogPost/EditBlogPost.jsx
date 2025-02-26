import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactQuill from 'react-quill';
import { Save, Trash2, ArrowLeft, Plus } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '../layout/AdminLayout';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { uploadToCloudinary } from '../../../utils/cloudinary';

export default function EditBlogPost() {
  const [originalPost, setOriginalPost] = useState(null);
  const [editedPost, setEditedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { postId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // For managing tags and topics input
  const [newTag, setNewTag] = useState('');
  const [newTopic, setNewTopic] = useState('');

  // Predefined topics for selection
  const availableTopics = [
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Python',
    'JavaScript',
    'React',
    'Node.js',
    'Database',
    'Cloud Computing',
    'DevOps'
  ];

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOriginalPost(data.post);
        setEditedPost(data.post);
      } else {
        throw new Error(data.message || 'Failed to fetch post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Error fetching post: ' + error.message);
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
        setOriginalPost(prev => ({
          ...prev,
          sections: prev.sections.map(s => 
            s._id === sectionId ? { ...s, content: section.content } : s
          )
        }));
        alert('Section saved successfully!');
      } else {
        throw new Error(data.message || 'Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section: ' + error.message);
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
        setEditedPost(prev => ({
          ...prev,
          sections: prev.sections.filter(section => section._id !== sectionId)
        }));
        setOriginalPost(prev => ({
          ...prev,
          sections: prev.sections.filter(section => section._id !== sectionId)
        }));
        alert('Section deleted successfully!');
      } else {
        throw new Error(data.message || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section: ' + error.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const postUpdateData = {
        title: editedPost.title,
        authorNameFE: editedPost.authorNameFE,
        bannerImage: editedPost.bannerImage,
        tags: editedPost.tags,
        topics: editedPost.topics,
        sections: editedPost.sections
      };

      const response = await fetch(`${API_URL}/api/blog-posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(postUpdateData)
      });

      const data = await response.json();

      if (data.success) {
        setOriginalPost(data.post);
        setEditedPost(data.post);
        alert('Blog post updated successfully!');
        navigate('/posts');
      } else {
        throw new Error(data.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadToCloudinary(file, 'image');
        setEditedPost(prev => ({
          ...prev,
          bannerImage: {
            url: imageUrl,
            alt: file.name
          }
        }));
      } catch (error) {
        console.error('Error uploading banner image:', error);
        // Add error notification here
      }
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !editedPost.tags.includes(newTag.trim())) {
      setEditedPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditedPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddTopic = (topic) => {
    if (!editedPost.topics.includes(topic)) {
      setEditedPost(prev => ({
        ...prev,
        topics: [...prev.topics, topic]
      }));
    }
    setNewTopic('');
  };

  const handleRemoveTopic = (topicToRemove) => {
    setEditedPost(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }));
  };

  const handleAddSection = async (type) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          type,
          content: type === 'text' ? '<p>New text section</p>' : '// Add your code here'
        })
      });

      const data = await response.json();
      if (data.success) {
        setEditedPost(prev => ({
          ...prev,
          sections: [...prev.sections, data.section]
        }));
        setOriginalPost(prev => ({
          ...prev,
          sections: [...prev.sections, data.section]
        }));
      } else {
        throw new Error(data.message || 'Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Failed to add section: ' + error.message);
    }
  };

  // Add a function to check if there are any changes
  const hasChanges = () => {
    if (!originalPost || !editedPost) return false;

    // Check basic fields
    if (originalPost.title !== editedPost.title) return true;
    if (originalPost.authorNameFE !== editedPost.authorNameFE) return true;
    if (originalPost.bannerImage?.url !== editedPost.bannerImage?.url) return true;
    
    // Check tags
    if (JSON.stringify(originalPost.tags) !== JSON.stringify(editedPost.tags)) return true;
    
    // Check topics
    if (JSON.stringify(originalPost.topics) !== JSON.stringify(editedPost.topics)) return true;

    // Check sections
    for (let i = 0; i < editedPost.sections.length; i++) {
      const originalSection = originalPost.sections.find(
        s => s._id === editedPost.sections[i]._id
      );
      if (!originalSection || originalSection.content !== editedPost.sections[i].content) {
        return true;
      }
    }

    return false;
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
          <div key={section._id} className="mb-8 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Text Section {index + 1}</h3>
            {sectionControls}
            <ReactQuill
              theme="snow"
              value={section.content}
              onChange={(content) => handleSectionContentChange(section._id, content)}
              className="bg-white rounded-lg"
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
          <div key={section._id} className="mb-8 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Code Section {index + 1}</h3>
            {sectionControls}
              <Editor
              height="300px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={section.content}
              onChange={(content) => handleSectionContentChange(section._id, content)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                readOnly: false,
                  wordWrap: 'on'
                }}
              />
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
            onClick={() => navigate('/posts')}
            className="flex items-center mb-6 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Posts
          </button>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold text-white mb-6">Edit Blog Post</h1>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={editedPost.title}
              onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Author Name</label>
              <input
                type="text"
                value={editedPost.authorNameFE}
                onChange={(e) => setEditedPost({ ...editedPost, authorNameFE: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
            />
          </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Banner Image</label>
              <div className="flex items-center space-x-4">
                {editedPost.bannerImage?.url && (
                  <img
                    src={editedPost.bannerImage.url}
                    alt={editedPost.bannerImage.alt}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageUpload}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editedPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Topics</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editedPost.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {topic}
                    <button
                      onClick={() => handleRemoveTopic(topic)}
                      className="ml-2 text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                value={newTopic}
                onChange={(e) => handleAddTopic(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
              >
                <option value="">Select a topic</option>
                {availableTopics
                  .filter(topic => !editedPost.topics.includes(topic))
                  .map((topic, index) => (
                    <option key={index} value={topic}>
                      {topic}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold text-gray-200">Content Sections</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddSection('text')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text Section
                  </button>
                  <button
                    onClick={() => handleAddSection('code')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Code Section
                  </button>
                </div>
              </div>
              
            {editedPost.sections.map((section, index) => renderSection(section, index))}
          </div>

            <div className="flex justify-end">
            <button
                onClick={handleSave}
                disabled={saving || !hasChanges()}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
            </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 