import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Save, ArrowLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../common/LoadingSpinner';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import CodeEditor from '../../common/CodeEditor';
import Modal from '../../common/Modal';

export default function CreateCourse() {
    const navigate = useNavigate();
    const [course, setCourse] = useState({
        title: '',
        description: '',
        duration: '4 months',
        students: 0,
        reviews: 0,
        rating: 4.9,
        instructor: {
            name: '',
            title: '',
            image: ''
        },
        resources: [
            { type: 'video', count: 56 },
            { type: 'exercise', count: 30 },
            { type: 'quiz', count: 15 },
            { type: 'download', count: 10 }
        ],
        modules: [],
        level: 'Intermediate',
        category: 'Web Development',
        image: '', // URL to course thumbnail
        prerequisites: {
            system: [],
            skills: []
        },
        courseIncludes: [
            { icon: '📹', value: '56', label: 'videos' },
            { icon: '📝', value: '30', label: 'exercises' },
            { icon: '📊', value: '15', label: 'quizzes' },
            { icon: '📥', value: '10', label: 'downloads' }
        ]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Modal states
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
    const [newModule, setNewModule] = useState({
        title: '',
        description: '',
        duration: '',
        lessons: []
    });
    const [newLesson, setNewLesson] = useState({
        title: '',
        description: '',
        duration: '',
        videoUrl: '',
        content: {
            text: '',
            code: ''
        },
        images: [],
        downloadableFiles: [],
        isLocked: true
    });
    
    // Accordion state
    const [expandedModule, setExpandedModule] = useState(null);

    // Add this near your other state declarations
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');

    // Add this constant at the top of your component
    const SUPPORTED_LANGUAGES = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'csharp', label: 'C#' },
        { value: 'php', label: 'PHP' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'swift', label: 'Swift' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'sql', label: 'SQL' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'typescript', label: 'TypeScript' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(course)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create course');
            }

            if (data.success) {
                console.log('Course created successfully:', data.course);
                navigate('/admin/course');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            // Add user feedback here
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddLesson = (moduleIndex) => {
        const newModules = [...course.modules];
        newModules[moduleIndex].lessons.push({
            title: '',
            description: '',
            duration: '',
            videoUrl: '',
            content: {
                text: '',
                code: ''
            },
            images: [],
            downloadableFiles: [],
            isLocked: true
        });
        setCourse({ ...course, modules: newModules });
    };

    const handleImageUpload = async (e, moduleIndex, lessonIndex) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading state
            setUploading(true);

            const url = await uploadToCloudinary(file, 'image');
            const newModules = [...course.modules];
            if (!newModules[moduleIndex].lessons[lessonIndex].images) {
                newModules[moduleIndex].lessons[lessonIndex].images = [];
            }
            newModules[moduleIndex].lessons[lessonIndex].images.push({
                url,
                caption: ''
            });
            setCourse({ ...course, modules: newModules });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e, moduleIndex, lessonIndex) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);

            const url = await uploadToCloudinary(file, 'raw');
            const newModules = [...course.modules];
            if (!newModules[moduleIndex].lessons[lessonIndex].downloadableFiles) {
                newModules[moduleIndex].lessons[lessonIndex].downloadableFiles = [];
            }
            newModules[moduleIndex].lessons[lessonIndex].downloadableFiles.push({
                url,
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            });
            setCourse({ ...course, modules: newModules });
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleModuleSubmit = () => {
        if (newModule.title.trim()) {
            setCourse({
                ...course,
                modules: [...course.modules, { ...newModule, lessons: [] }]
            });
            setNewModule({ title: '', description: '', duration: '', lessons: [] });
            setShowModuleModal(false);
        }
    };

    const handleLessonSubmit = () => {
        if (newLesson.title.trim() && currentModuleIndex !== null) {
            setCourse({
                ...course,
                modules: course.modules.map((module, idx) => 
                    idx === currentModuleIndex
                        ? { ...module, lessons: [...module.lessons, newLesson] }
                        : module
                )
            });
            setNewLesson({ title: '', description: '', duration: '', videoUrl: '', content: { text: '', code: '' }, images: [], downloadableFiles: [], isLocked: true });
            setShowLessonModal(false);
        }
    };

    const openLessonModal = (moduleIndex) => {
        setCurrentModuleIndex(moduleIndex);
        setShowLessonModal(true);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin/course')}
                    className="flex items-center text-gray-300 hover:text-white mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Courses
                </button>

                <h1 className="text-3xl font-bold mb-8">Create New Course</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Course Information */}
                    <div className="bg-[#1e293b] p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Course Title</label>
                                <input
                                    type="text"
                                    value={course.title}
                                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                    className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                    placeholder="e.g., Advanced JavaScript & React Development"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={course.description}
                                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                    className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg h-32"
                                    placeholder="Course description..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Duration</label>
                                    <input
                                        type="text"
                                        value={course.duration}
                                        onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                                        className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                        placeholder="e.g., 4 months"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Number of Students</label>
                                    <input
                                        type="number"
                                        value={course.students}
                                        onChange={(e) => setCourse({ ...course, students: parseInt(e.target.value) })}
                                        className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                    />
                                </div>
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
                                        {/* Add more categories as needed */}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Thumbnail */}
                    <div className="bg-[#1e293b] p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-6">Course Thumbnail</h2>
                        <input
                            type="text"
                            value={course.image}
                            onChange={(e) => setCourse({ ...course, image: e.target.value })}
                            className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                            placeholder="Enter image URL"
                        />
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
                                    placeholder="Instructor name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Title/Experience</label>
                                <input
                                    type="text"
                                    value={course.instructor.title}
                                    onChange={(e) => setCourse({
                                        ...course,
                                        instructor: { ...course.instructor, title: e.target.value }
                                    })}
                                    className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                    placeholder="e.g., Lead Frontend Developer"
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
                                    placeholder="https://example.com/instructor-image.jpg"
                                />
                                {course.instructor.image && (
                                    <div className="mt-2">
                                        <img
                                            src={course.instructor.image}
                                            alt="Instructor preview"
                                            className="w-16 h-16 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.jpg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Course Resources */}
                    <div className="bg-[#1e293b] p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-6">Course Resources</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {course.resources.map((resource, index) => (
                                <div key={resource.type}>
                                    <label className="block text-sm font-medium mb-2">
                                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}s
                                    </label>
                                    <input
                                        type="number"
                                        value={resource.count}
                                        onChange={(e) => {
                                            const newResources = [...course.resources];
                                            newResources[index].count = parseInt(e.target.value);
                                            setCourse({ ...course, resources: newResources });
                                        }}
                                        className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Curriculum */}
                    <div className="bg-[#1e293b] p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Course Curriculum</h2>
                            <button
                                type="button"
                                onClick={() => setShowModuleModal(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Module
                            </button>
                        </div>

                        {/* Modules List with Accordion */}
                        <div className="space-y-4">
                        {course.modules.map((module, moduleIndex) => (
                                <div key={moduleIndex} className="bg-[#334155] rounded-lg overflow-hidden">
                                    <div 
                                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#4a5568]"
                                        onClick={() => setExpandedModule(expandedModule === moduleIndex ? null : moduleIndex)}
                                    >
                                        <h3 className="text-white font-medium">{module.title}</h3>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openLessonModal(moduleIndex);
                                                }}
                                                className="text-blue-400 hover:text-blue-300"
                                            >
                                                <Plus className="w-4 h-4" />
                                                            </button>
                                            {expandedModule === moduleIndex ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                                </div>
                                            </div>

                                    {expandedModule === moduleIndex && (
                                        <div className="p-4 bg-[#5a657a]">
                                            <p className="text-gray-400 mb-2">{module.description}</p>
                                                <div className="space-y-2">
                                                {module.lessons.map((lesson, lessonIndex) => (
                                                    <div key={lessonIndex} className="bg-[#6b7280] p-3 rounded flex justify-between items-center">
                                                        <span className="text-white">{lesson.title}</span>
                                                        <span className="text-gray-400">{lesson.duration}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="small" />
                                <span className="ml-2">Creating Course...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Course
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Module Creation Modal */}
            <Modal
                isOpen={showModuleModal}
                onClose={() => setShowModuleModal(false)}
                title="Add New Module"
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Module Title"
                        value={newModule.title}
                        onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <textarea
                        placeholder="Module Description"
                        value={newModule.description}
                        onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 bg-gray-700 text-white rounded h-24"
                    />
                    <input
                        type="text"
                        placeholder="Module Duration (e.g., 2 weeks)"
                        value={newModule.duration}
                        onChange={(e) => setNewModule(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowModuleModal(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleModuleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Add Module
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Lesson Creation Modal */}
            <Modal
                isOpen={showLessonModal}
                onClose={() => setShowLessonModal(false)}
                title="Add New Lesson"
            >
                <div className="max-h-[80vh] overflow-y-auto">
                    <div className="space-y-6 p-6">
                        {/* Basic Information Section */}
                        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                            <input
                                type="text"
                                placeholder="Lesson Title"
                                value={newLesson.title}
                                onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <textarea
                                placeholder="Lesson Description"
                                value={newLesson.description}
                                onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Duration (e.g., 15 mins)"
                                    value={newLesson.duration}
                                    onChange={(e) => setNewLesson(prev => ({ ...prev, duration: e.target.value }))}
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="url"
                                    placeholder="Video URL"
                                    value={newLesson.videoUrl}
                                    onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Lesson Content</h3>
                            <textarea
                                placeholder="Text Content"
                                value={newLesson.content.text}
                                onChange={(e) => setNewLesson(prev => ({
                                    ...prev,
                                    content: { ...prev.content, text: e.target.value }
                                }))}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-32"
                            />
                            
                            {/* Code Editor Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-300">Code Example</label>
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="bg-gray-700 text-white rounded-lg border border-gray-600 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        {SUPPORTED_LANGUAGES.map(lang => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <CodeEditor
                                    value={newLesson.content.code}
                                    onChange={(code) => setNewLesson(prev => ({
                                        ...prev,
                                        content: { ...prev.content, code }
                                    }))}
                                    language={selectedLanguage}
                                    className="h-48 rounded-lg overflow-hidden"
                                />
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Media & Resources</h3>
                            
                            {/* Images Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Images</label>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {newLesson.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img src={image.url} alt="" className="w-24 h-24 object-cover rounded-lg" />
                                            <button
                                                onClick={() => {
                                                    setNewLesson(prev => ({
                                                        ...prev,
                                                        images: prev.images.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = await uploadToCloudinary(file, 'image');
                                            setNewLesson(prev => ({
                                                ...prev,
                                                images: [...prev.images, { url, caption: '' }]
                                            }));
                                        }
                                    }}
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Downloadable Files Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Downloadable Files</label>
                                <div className="space-y-2 mb-3">
                                    {newLesson.downloadableFiles.map((file, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                            <span className="text-sm">{file.name}</span>
                                            <button
                                                onClick={() => {
                                                    setNewLesson(prev => ({
                                                        ...prev,
                                                        downloadableFiles: prev.downloadableFiles.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = await uploadToCloudinary(file, 'raw');
                                            setNewLesson(prev => ({
                                                ...prev,
                                                downloadableFiles: [...prev.downloadableFiles, {
                                                    url,
                                                    name: file.name,
                                                    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                                }]
                                            }));
                                        }
                                    }}
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-4">Lesson Settings</h3>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={newLesson.isLocked}
                                    onChange={(e) => setNewLesson(prev => ({ ...prev, isLocked: e.target.checked }))}
                                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="text-gray-300">Lock this lesson (Premium content)</label>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-900 px-6 py-4 flex justify-end space-x-3 sticky bottom-0">
                        <button
                            onClick={() => setShowLessonModal(false)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLessonSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Lesson
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 