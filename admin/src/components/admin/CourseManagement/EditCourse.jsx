import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Save, ArrowLeft, Type, Code, Image, Video, FileText, X } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import CodeEditor from '../../../common/CodeEditor';
import Modal from '../../../common/Modal';

export default function EditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [course, setCourse] = useState(null);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);
    const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [newLesson, setNewLesson] = useState({
        title: '',
        description: '',
        duration: '',
        videoUrl: '',
        isLocked: false,
        sections: []
    });
    const [showNewLessonModal, setShowNewLessonModal] = useState(false);
    const [currentModuleIndexForNewLesson, setCurrentModuleIndexForNewLesson] = useState(null);

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/courses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCourse(data.course);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(course)
            });

            const data = await response.json();
            if (data.success) {
                alert('Course updated successfully!');
                navigate('/courses');
            } else {
                throw new Error(data.message || 'Failed to update course');
            }
        } catch (error) {
            console.error('Error updating course:', error);
            alert(error.message || 'Failed to update course');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatYoutubeUrl = (url) => {
        try {
            let videoId = '';
            if (url.includes('youtu.be')) {
                videoId = url.split('youtu.be/')[1];
            } else if (url.includes('watch?v=')) {
                videoId = url.split('watch?v=')[1];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('youtube.com/embed/')[1];
            }
            
            // Remove any additional parameters
            videoId = videoId.split('&')[0];
            
            // Return the full embed URL
            return `https://www.youtube.com/embed/${videoId}`;
        } catch (error) {
            console.error('Error formatting YouTube URL:', error);
            return url; // Return original URL if formatting fails
        }
    };

    // Function to handle adding a new lesson
    const handleAddLesson = (moduleIndex) => {
        setCurrentModuleIndexForNewLesson(moduleIndex);
        setNewLesson({
            title: '',
            description: '',
            duration: '',
            videoUrl: '',
            isLocked: false,
            sections: []
        });
        setShowNewLessonModal(true);
    };

    // Function to save new lesson
    const handleNewLessonSave = () => {
        if (!newLesson.title) {
            alert('Lesson title is required');
            return;
        }

        const updatedCourse = { ...course };
        updatedCourse.modules[currentModuleIndexForNewLesson].lessons.push(newLesson);
        setCourse(updatedCourse);
        setShowNewLessonModal(false);
        setNewLesson({
            title: '',
            description: '',
            duration: '',
            videoUrl: '',
            isLocked: false,
            sections: []
        });
    };

    // Function to update section content
    const updateSectionContent = (index, newContent) => {
        setEditingLesson(prev => ({
            ...prev,
            sections: prev.sections.map((section, i) => 
                i === index ? { ...section, content: newContent } : section
            )
        }));
    };

    // Function to remove section
    const removeSection = (index) => {
        setEditingLesson(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    // Function to edit lesson
    const handleEditLesson = (moduleIndex, lessonIndex, e) => {
        // Prevent event propagation to avoid form submission
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const lesson = course.modules[moduleIndex].lessons[lessonIndex];
        setCurrentModuleIndex(moduleIndex);
        setEditingLesson({
            ...lesson,
            sections: lesson.sections?.map(section => ({
                ...section,
                content: section.content || {}
            })) || []
        });
        setShowLessonModal(true);
    };

    // Function to save lesson changes
    const handleLessonSave = () => {
        if (!editingLesson || currentModuleIndex === null) return;

        const updatedCourse = { ...course };
        const lessonIndex = updatedCourse.modules[currentModuleIndex].lessons
            .findIndex(l => l._id === editingLesson._id);

        if (lessonIndex !== -1) {
            // Update the lesson with all its properties
            updatedCourse.modules[currentModuleIndex].lessons[lessonIndex] = {
                ...editingLesson,
                title: editingLesson.title,
                duration: editingLesson.duration,
                videoUrl: editingLesson.videoUrl,
                description: editingLesson.description,
                sections: editingLesson.sections || []
            };

            // Update the course state
            setCourse(updatedCourse);
            
            // Close the modal and reset editing state
            setShowLessonModal(false);
            setEditingLesson(null);
            setShowAddSectionMenu(false);
        }
    };

    // Add this function after other state declarations
    const addContentSection = (type) => {
        const newSection = {
            type,
            content: type === 'code' ? {
                code: '',
                language: 'javascript'
            } : type === 'image' ? {
                url: '',
                caption: ''
            } : type === 'file' ? {
                url: '',
                name: '',
                size: ''
            } : type === 'text' ? {
                text: ''
            } : ''
        };

        setEditingLesson(prev => ({
            ...prev,
            sections: [...(prev.sections || []), newSection]
        }));
        setShowAddSectionMenu(false);
    };

    // Add this function to handle file uploads for content sections
    const handleFileUploadForSection = async (sectionIndex, file) => {
        if (!file) return;
        
        try {
            // Create a FormData object to send the file
            const formData = new FormData();
            formData.append('file', file);
            
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/uploads/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                console.log("File uploaded successfully:", data);
                // Update the section with the file information
                updateSectionContent(sectionIndex, {
                    url: data.fileUrl,
                    name: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                    type: file.type
                });
            } else {
                throw new Error(data.message || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file: ' + (error.message || 'Unknown error'));
        }
    };

    // Update the renderSectionEditor function
    const renderSectionEditor = (section, index) => {
        switch (section.type) {
            case 'text':
                return (
                    <div>
                        <label className="block text-gray-300 mb-2">Text Content</label>
                        <textarea
                            value={section.content.text || ''}
                            onChange={(e) => updateSectionContent(index, { text: e.target.value })}
                            className="w-full bg-gray-600 text-white rounded-lg p-3 min-h-[100px]"
                            placeholder="Enter text content..."
                        />
                    </div>
                );

            case 'code':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-300">Code Example</label>
                            <select
                                value={section.content.language || 'javascript'}
                                onChange={(e) => updateSectionContent(index, { 
                                    ...section.content, 
                                    language: e.target.value 
                                })}
                                className="bg-gray-600 text-white rounded-lg px-3 py-1"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                            </select>
                        </div>
                        <CodeEditor
                            value={section.content.code || ''}
                            onChange={(value) => updateSectionContent(index, { 
                                ...section.content, 
                                code: value 
                            })}
                            language={section.content.language || 'javascript'}
                        />
                    </div>
                );

            case 'image':
                return (
                    <div>
                        <label className="block text-gray-300 mb-2">Image Upload</label>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        try {
                                            const imageUrl = await uploadToCloudinary(file);
                                            updateSectionContent(index, {
                                                ...section.content,
                                                url: imageUrl
                                            });
                                        } catch (error) {
                                            console.error('Error uploading image:', error);
                                            alert('Failed to upload image');
                                        }
                                    }
                                }}
                                className="w-full"
                            />
                            {section.content.url && (
                                <img
                                    src={section.content.url}
                                    alt="Preview"
                                    className="max-w-full h-auto rounded-lg"
                                />
                            )}
                            <input
                                type="text"
                                value={section.content.caption || ''}
                                onChange={(e) => updateSectionContent(index, {
                                    ...section.content,
                                    caption: e.target.value
                                })}
                                placeholder="Image caption (optional)"
                                className="w-full bg-gray-600 text-white rounded-lg p-3"
                            />
                        </div>
                    </div>
                );

            case 'file':
                return (
                    <div>
                        <label className="block text-gray-300 mb-2">Downloadable File</label>
                        {section.content.url ? (
                            <div className="bg-gray-600 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">{section.content.name}</p>
                                        <p className="text-sm text-gray-300">{section.content.size}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <a 
                                            href={section.content.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Preview
                                        </a>
                                        <button
                                            onClick={() => {
                                                // Replace the file
                                                const fileInput = document.createElement('input');
                                                fileInput.type = 'file';
                                                fileInput.addEventListener('change', (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUploadForSection(index, file);
                                                    }
                                                });
                                                fileInput.click();
                                            }}
                                            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                                        >
                                            Replace
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleFileUploadForSection(index, file);
                                        }
                                    }}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-400">
                                    Upload PDFs, documents, or other files for students to download
                                </p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    // Render lesson content in the main view
    const renderLessonContent = (lesson, moduleIndex, lessonIndex) => {
        return (
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                {/* Basic Lesson Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => {
                                const newModules = [...course.modules];
                                newModules[moduleIndex].lessons[lessonIndex].title = e.target.value;
                                setCourse({ ...course, modules: newModules });
                            }}
                            className="w-full bg-gray-700 text-white rounded-lg p-3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                        <input
                            type="text"
                            value={lesson.duration}
                            onChange={(e) => {
                                const newModules = [...course.modules];
                                newModules[moduleIndex].lessons[lessonIndex].duration = e.target.value;
                                setCourse({ ...course, modules: newModules });
                            }}
                            className="w-full bg-gray-700 text-white rounded-lg p-3"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Video URL</label>
                    <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={(e) => {
                            const newModules = [...course.modules];
                            newModules[moduleIndex].lessons[lessonIndex].videoUrl = e.target.value;
                            setCourse({ ...course, modules: newModules });
                        }}
                        className="w-full bg-gray-700 text-white rounded-lg p-3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                        value={lesson.description}
                        onChange={(e) => {
                            const newModules = [...course.modules];
                            newModules[moduleIndex].lessons[lessonIndex].description = e.target.value;
                            setCourse({ ...course, modules: newModules });
                        }}
                        className="w-full h-32 bg-gray-700 text-white rounded-lg p-3"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={lesson.isLocked}
                        onChange={(e) => {
                            const newModules = [...course.modules];
                            newModules[moduleIndex].lessons[lessonIndex].isLocked = e.target.checked;
                            setCourse({ ...course, modules: newModules });
                        }}
                        className="bg-gray-700 rounded"
                    />
                    <label className="text-sm font-medium text-gray-300">Lock Lesson</label>
                </div>

                {/* Content Sections Preview */}
                <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">Content Sections</h3>
                        <button
                            type="button"
                            onClick={(e) => handleEditLesson(moduleIndex, lessonIndex, e)}
                            className="text-blue-500 hover:text-blue-600"
                        >
                            Edit Content
                        </button>
                    </div>

                    {/* Preview of content sections */}
                    <div className="space-y-4">
                        {lesson.sections?.map((section, idx) => (
                            <div key={idx} className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center text-gray-300 mb-2">
                                    {section.type === 'text' && <Type className="w-4 h-4 mr-2" />}
                                    {section.type === 'code' && <Code className="w-4 h-4 mr-2" />}
                                    {section.type === 'image' && <Image className="w-4 h-4 mr-2" />}
                                    {section.type === 'file' && <FileText className="w-4 h-4 mr-2" />}
                                    <span className="capitalize">{section.type} Content</span>
                                </div>
                                
                                {section.type === 'text' && (
                                    <p className="text-gray-400 line-clamp-2">{section.content.text}</p>
                                )}
                                {section.type === 'code' && (
                                    <div className="text-gray-400">
                                        <p>Language: {section.content.language}</p>
                                        <p className="line-clamp-2 font-mono">{section.content.code}</p>
                                    </div>
                                )}
                                {section.type === 'image' && (
                                    <div className="text-gray-400">
                                        <img src={section.content.url} alt="" className="w-20 h-20 object-cover rounded" />
                                        {section.content.caption && <p className="mt-1">{section.content.caption}</p>}
                                    </div>
                                )}
                                {section.type === 'file' && (
                                    <div className="text-gray-400">
                                        <p>{section.content.name}</p>
                                        <p className="text-sm">{section.content.size}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (loading || !course) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-300 font-medium">Loading course...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            {loading ? (
                <LoadingSpinner size="large" />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={() => navigate('/courses')}
                            className="flex items-center text-gray-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Courses
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl font-bold mb-8">Edit Course</h1>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Course Information */}
                                <div className="bg-[#1e293b] p-6 rounded-xl">
                                    <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-gray-300 mb-2">Course Title</label>
                                                <input
                                                    type="text"
                                                    value={course.title}
                                                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                                    className="w-full bg-gray-700 text-white rounded-lg p-3"
                                                />
                                            </div>
                                            
                                            {/* Add Price Field */}
                                            <div>
                                                <label className="block text-gray-300 mb-2">
                                                    Course Price (₹) <span className="text-gray-400 text-sm">(0 for free courses)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={course.price}
                                                    onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })}
                                                    className="w-full bg-gray-700 text-white rounded-lg p-3"
                                                    placeholder="Enter course price (0 for free)"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-gray-300 mb-2">Description</label>
                                            <textarea
                                                value={course.description}
                                                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                                className="w-full bg-gray-700 text-white rounded-lg p-3 h-32"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Level</label>
                                                <select
                                                    value={course.level}
                                                    onChange={(e) => setCourse({ ...course, level: e.target.value })}
                                                    className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                                >
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Category</label>
                                                <select
                                                    value={course.category}
                                                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                                                    className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                                >
                                                    <option value="Web Development">Web Development</option>
                                                    <option value="Mobile Development">Mobile Development</option>
                                                    <option value="Data Science">Data Science</option>
                                                    <option value="Machine Learning">Machine Learning</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructor Information */}
                                <div className="bg-[#1e293b] p-6 rounded-xl">
                                    <h2 className="text-xl font-semibold mb-6">Instructor Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Name</label>
                                            <input
                                                type="text"
                                                value={course.instructor.name}
                                                onChange={(e) => setCourse({
                                                    ...course,
                                                    instructor: { ...course.instructor, name: e.target.value }
                                                })}
                                                className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={course.instructor.title}
                                                onChange={(e) => setCourse({
                                                    ...course,
                                                    instructor: { ...course.instructor, title: e.target.value }
                                                })}
                                                className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                                            <input
                                                type="text"
                                                value={course.instructor.image}
                                                onChange={(e) => setCourse({
                                                    ...course,
                                                    instructor: { ...course.instructor, image: e.target.value }
                                                })}
                                                className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Course Content */}
                                <div className="bg-[#1e293b] p-6 rounded-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">Course Content</h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newModules = [...course.modules, {
                                                    title: '',
                                                    duration: '',
                                                    lessons: []
                                                }];
                                                setCourse({ ...course, modules: newModules });
                                            }}
                                            className="flex items-center px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                                        >
                                            <Plus className="w-5 h-5 mr-2" />
                                            Add Module
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {course.modules.map((module, moduleIndex) => (
                                            <div key={moduleIndex} className="bg-[#334155] p-6 rounded-xl">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-lg font-semibold">Module {moduleIndex + 1}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newModules = course.modules.filter((_, index) => index !== moduleIndex);
                                                            setCourse({ ...course, modules: newModules });
                                                        }}
                                                        className="text-red-500 hover:text-red-400"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {module.lessons.map((lesson, lessonIndex) => (
                                                        <div key={lessonIndex} className="bg-[#1e293b] p-4 rounded-lg">
                                                            {renderLessonContent(lesson, moduleIndex, lessonIndex)}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddLesson(moduleIndex)}
                                                        className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                                                    >
                                                        <Plus className="w-5 h-5 mr-2" />
                                                        Add Lesson
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Add New Lesson Modal */}
            <Modal 
                isOpen={showNewLessonModal} 
                onClose={() => setShowNewLessonModal(false)}
                title="Add New Lesson"
                modalClassName="sm:max-w-[1400px] sm:w-full sm:h-[100vh]"
            >
                <div className="p-8">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-gray-300 mb-2">Lesson Title</label>
                            <input
                                type="text"
                                value={newLesson.title}
                                onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-gray-700 text-white rounded-lg p-3"
                                placeholder="Enter lesson title"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Duration</label>
                            <input
                                type="text"
                                value={newLesson.duration}
                                onChange={(e) => setNewLesson(prev => ({ ...prev, duration: e.target.value }))}
                                className="w-full bg-gray-700 text-white rounded-lg p-3"
                                placeholder="e.g., 15 minutes"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Video URL</label>
                        <input
                            type="text"
                            value={newLesson.videoUrl}
                            onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg p-3"
                            placeholder="Enter YouTube video URL"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Description</label>
                        <textarea
                            value={newLesson.description}
                            onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg p-3 h-32"
                            placeholder="Enter lesson description"
                        />
                    </div>

                    {/* Add Lesson Lock Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newLesson.isLocked}
                                onChange={(e) => setNewLesson(prev => ({ ...prev, isLocked: e.target.checked }))}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                            />
                            <span className="text-gray-300">Lock this lesson (Premium content)</span>
                        </label>
                        <p className="text-gray-400 text-sm mt-1 ml-8">
                            Locked lessons are only available to paid subscribers
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-6">
                        {newLesson.sections?.map((section, index) => (
                            <div key={index} className="relative bg-gray-700 rounded-lg p-6">
                                <button
                                    onClick={() => {
                                        setNewLesson(prev => ({
                                            ...prev,
                                            sections: prev.sections.filter((_, i) => i !== index)
                                        }));
                                    }}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                {renderSectionEditor(section, index, true)}
                            </div>
                        ))}

                        {/* Add Section Button */}
                        <div className="relative inline-block">
                            <button
                                type="button"
                                onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
                                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Content Section</span>
                            </button>

                            {showAddSectionMenu && (
                                <div className="absolute top-full left-0 mt-2 w-80 bg-gray-700 rounded-lg shadow-xl border border-gray-600 p-3 z-[100]">
                                    {[
                                        { type: 'text', icon: Type, label: 'Text Content', desc: 'Add formatted text' },
                                        { type: 'code', icon: Code, label: 'Code Example', desc: 'Add code with syntax highlighting' },
                                        { type: 'image', icon: Image, label: 'Image Upload', desc: 'Upload and embed image' },
                                        { type: 'file', icon: FileText, label: 'Downloadable File', desc: 'Add downloadable resource' }
                                    ].map(({ type, icon: Icon, label, desc }) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                addContentSection(type, true);
                                            }}
                                            className="flex items-start space-x-3 w-full p-3 hover:bg-gray-600 rounded-lg text-white transition-colors mb-2 last:mb-0"
                                        >
                                            <Icon className="w-5 h-5 text-blue-400 mt-0.5" />
                                            <div className="text-left">
                                                <div className="font-medium">{label}</div>
                                                <div className="text-sm text-gray-400">{desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            onClick={() => setShowNewLessonModal(false)}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleNewLessonSave}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add Lesson
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Lesson Edit Modal */}
            <Modal 
                isOpen={showLessonModal} 
                onClose={() => setShowLessonModal(false)}
                title="Edit Lesson Content"
                modalClassName="sm:max-w-[1400px] sm:w-full sm:h-[90vh]"
            >
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-gray-300 mb-2">Lesson Title</label>
                            <input
                                type="text"
                                value={editingLesson?.title || ''}
                                onChange={(e) => setEditingLesson(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-gray-700 text-white rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Duration</label>
                            <input
                                type="text"
                                value={editingLesson?.duration || ''}
                                onChange={(e) => setEditingLesson(prev => ({ ...prev, duration: e.target.value }))}
                                className="w-full bg-gray-700 text-white rounded-lg p-3"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Video URL</label>
                        <input
                            type="text"
                            value={editingLesson?.videoUrl || ''}
                            onChange={(e) => setEditingLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                            className="w-full bg-gray-700 text-white rounded-lg p-3"
                        />
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-6">
                        {editingLesson?.sections?.map((section, index) => (
                            <div key={index} className="relative bg-gray-700 rounded-lg p-6">
                                <button
                                    onClick={() => removeSection(index)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                {renderSectionEditor(section, index)}
                            </div>
                        ))}

                        {/* Add Section Button */}
                        <div className="relative inline-block">
                            <button
                                type="button"
                                onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
                                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Content Section</span>
                            </button>

                            {showAddSectionMenu && (
                                <div className="absolute top-full left-0 mt-2 w-80 bg-gray-700 rounded-lg shadow-xl border border-gray-600 p-3 z-[100]">
                                    {[
                                        { type: 'text', icon: Type, label: 'Text Content', desc: 'Add formatted text' },
                                        { type: 'code', icon: Code, label: 'Code Example', desc: 'Add code with syntax highlighting' },
                                        { type: 'image', icon: Image, label: 'Image Upload', desc: 'Upload and embed image' },
                                        { type: 'file', icon: FileText, label: 'Downloadable File', desc: 'Add downloadable resource' }
                                    ].map(({ type, icon: Icon, label, desc }) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => addContentSection(type)}
                                            className="flex items-start space-x-3 w-full p-3 hover:bg-gray-600 rounded-lg text-white transition-colors mb-2 last:mb-0"
                                        >
                                            <Icon className="w-5 h-5 text-blue-400 mt-0.5" />
                                            <div className="text-left">
                                                <div className="font-medium">{label}</div>
                                                <div className="text-sm text-gray-400">{desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer with buttons */}
                    <div className="mt-8 flex justify-end space-x-4 sticky bottom-0 bg-gray-800 py-4 border-t border-gray-700">
                        <button
                            onClick={() => setShowLessonModal(false)}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLessonSave}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 