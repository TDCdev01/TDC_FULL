import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Save, ArrowLeft, X, ChevronDown, ChevronUp, Type, Code, Image, Video, FileText } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../../common/LoadingSpinner';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import CodeEditor from '../../../common/CodeEditor';
import Modal from '../../../common/Modal';

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
        isLocked: false,
        content: [] // Array to hold multiple content sections
    });
    const [showAddMenu, setShowAddMenu] = useState(false);
    
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
                navigate('/courses');
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

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const imageUrl = await uploadToCloudinary(file, 'image');
            setNewLesson(prev => ({
                ...prev,
                content: [...prev.content, { type: 'image', id: Date.now(), content: { url: imageUrl, caption: '' } }]
            }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return null;
        
        try {
            setUploading(true);
            console.log("Uploading file:", file.name);
            
            // Create FormData with the file
            const formData = new FormData();
            formData.append('file', file);
            
            // Log the FormData to confirm it contains the file
            console.log("FormData created with file:", file.name, file.type, file.size);
            
            const token = localStorage.getItem('adminToken');
            console.log("Using token for auth:", token ? 'Yes (token exists)' : 'No (token missing)');
            
            // Send to the server
            const response = await fetch(`${API_URL}/api/uploads/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type here - it will be set automatically with boundary
                },
                body: formData
            });
            
            console.log("Server response status:", response.status);
            
            const data = await response.json();
            console.log("Server response:", data);
            
            if (data.success) {
                console.log("File uploaded successfully:", data.fileUrl);
                return data.fileUrl;
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleFileUploadForSection = async (sectionId, file) => {
        if (!file) return;
        
        try {
            setUploading(true);
            
            // Use the main upload function 
            const fileUrl = await handleFileUpload(file);
            
            if (fileUrl) {
                // Add the file to the specific content section
                setNewLesson(prev => ({
                    ...prev,
                    content: prev.content.map(section => 
                        section.id === sectionId 
                            ? { 
                                ...section, 
                                content: { 
                                    url: fileUrl,
                                    name: file.name,
                                    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                                    type: file.type
                                } 
                            } 
                            : section
                    )
                }));
            }
        } catch (error) {
            console.error('Error uploading file for section:', error);
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
            // Create a properly formatted lesson object
            const lessonToAdd = {
                title: newLesson.title,
                description: newLesson.description,
                duration: newLesson.duration,
                videoUrl: newLesson.videoUrl,
                isLocked: newLesson.isLocked || false,
                sections: newLesson.content.map(section => ({
                    type: section.type,
                    content: section.content
                }))
            };

            setCourse(prevCourse => ({
                ...prevCourse,
                modules: prevCourse.modules.map((module, idx) => 
                    idx === currentModuleIndex
                        ? { ...module, lessons: [...module.lessons, lessonToAdd] }
                        : module
                )
            }));

            // Reset the form
            setNewLesson({
                title: '',
                description: '',
                duration: '',
                videoUrl: '',
                isLocked: false,
                content: []
            });
            setShowLessonModal(false);
            setShowAddMenu(false);
        }
    };

    const openLessonModal = (e, moduleIndex) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentModuleIndex(moduleIndex);
        setShowLessonModal(true);
    };

    const addContentSection = (type) => {
        const newSection = {
            type,
            id: Date.now(), // for UI purposes only
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

        setNewLesson(prev => ({
            ...prev,
            content: [...prev.content, newSection]
        }));
        setShowAddMenu(false);
    };

    const updateContentSection = (id, newContent) => {
        setNewLesson(prev => ({
            ...prev,
            content: prev.content.map(section => 
                section.id === id ? { ...section, content: newContent } : section
            )
        }));
    };

    const removeContentSection = (id) => {
        setNewLesson(prev => ({
            ...prev,
            content: prev.content.filter(section => section.id !== id)
        }));
    };

    const renderContentSection = (section) => {
        switch (section.type) {
            case 'text':
                return (
                    <div className="space-y-2">
                        <label className="text-gray-300">Text Content</label>
                        <textarea
                            value={section.content.text || ''}
                            onChange={(e) => updateContentSection(section.id, {
                                ...section.content,
                                text: e.target.value
                            })}
                            className="w-full h-32 bg-gray-700 text-white rounded-lg p-3"
                            placeholder="Enter text content..."
                        />
                    </div>
                );
            case 'code':
                return (
                    <div className="space-y-2">
                        <label className="text-gray-300">Code Example</label>
                        <select
                            value={section.content.language || 'javascript'}
                            onChange={(e) => updateContentSection(section.id, {
                                ...section.content,
                                language: e.target.value
                            })}
                            className="w-full bg-gray-700 text-white rounded-lg p-2 mb-2"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="sql">SQL</option>
                        </select>
                        <CodeEditor
                            value={section.content.code || ''}
                            onChange={(code) => updateContentSection(section.id, {
                                ...section.content,
                                code
                            })}
                            language={section.content.language || 'javascript'}
                        />
                    </div>
                );
            case 'image':
                return (
                    <div className="space-y-2">
                        <label className="text-gray-300">Image Upload</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const imageUrl = await uploadToCloudinary(file, 'image');
                                    updateContentSection(section.id, {
                                        url: imageUrl,
                                        caption: section.content.caption
                                    });
                                }
                            }}
                            className="w-full"
                        />
                        <input
                            type="text"
                            value={section.content.caption || ''}
                            onChange={(e) => updateContentSection(section.id, {
                                ...section.content,
                                caption: e.target.value
                            })}
                            placeholder="Image caption"
                            className="w-full bg-gray-700 text-white rounded-lg p-2"
                        />
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
                                    <a 
                                        href={section.content.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Preview
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleFileUploadForSection(section.id, file);
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

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/courses')}
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
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Course Thumbnail</label>
                            <div className="flex flex-col space-y-2">
                                {course.image ? (
                                    <div className="relative mb-2">
                                        <img 
                                            src={course.image} 
                                            alt="Course thumbnail preview" 
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setCourse({...course, image: ''})}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        className="border-2 border-dashed border-gray-500 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => document.getElementById('courseImageInput').click()}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.currentTarget.classList.add('border-blue-500', 'bg-blue-500', 'bg-opacity-10');
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500', 'bg-opacity-10');
                                        }}
                                        onDrop={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500', 'bg-opacity-10');
                                            
                                            const file = e.dataTransfer.files[0];
                                            if (file && file.type.startsWith('image/')) {
                                                try {
                                                    setUploading(true);
                                                    const imageUrl = await uploadToCloudinary(file);
                                                    setCourse({...course, image: imageUrl});
                                                } catch (error) {
                                                    console.error('Error uploading image:', error);
                                                    alert('Failed to upload image');
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }
                                        }}
                                    >
                                        {uploading ? (
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <LoadingSpinner size="small" />
                                                <p className="mt-2 text-gray-400">Uploading image...</p>
                                            </div>
                                        ) : (
                                            <div className="py-8">
                                                <Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-400 mb-2">Drag & drop an image or click to browse</p>
                                                <p className="text-xs text-gray-500">Recommended size: 1280x720px</p>
                                                <button 
                                                    type="button"
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Browse Files
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <input
                                    id="courseImageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                setUploading(true);
                                                const imageUrl = await uploadToCloudinary(file);
                                                setCourse({...course, image: imageUrl});
                                            } catch (error) {
                                                console.error('Error uploading image:', error);
                                                alert('Failed to upload image');
                                            } finally {
                                                setUploading(false);
                                            }
                                        }
                                    }}
                                    className="hidden" // Now properly hidden but accessible via click
                                />
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
                                                                type="button"
                                                onClick={(e) => openLessonModal(e, moduleIndex)}
                                                className="text-blue-400 hover:text-blue-300 p-2"
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
            <Modal isOpen={showLessonModal} onClose={() => setShowLessonModal(false)}>
                <div className="bg-gray-800 rounded-lg w-[90vw] max-w-7xl max-h-[90vh] overflow-hidden relative">
                    {/* Modal Header */}
                    <div className="bg-gray-900 px-8 py-4 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Add New Lesson</h2>
                        <button 
                            onClick={() => setShowLessonModal(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Content - Scrollable */}
                    <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-6 mb-8">
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
                                <label className="block text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={newLesson.description}
                                    onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full h-32 bg-gray-700 text-white rounded-lg p-3"
                                    placeholder="Enter lesson description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
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
                                <div>
                                    <label className="block text-gray-300 mb-2">Video URL</label>
                                    <input
                                        type="text"
                                        value={newLesson.videoUrl}
                                        onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                                        className="w-full bg-gray-700 text-white rounded-lg p-3"
                                        placeholder="Enter video URL"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-6">
                            {newLesson.content.map((section) => (
                                <div key={section.id} className="relative bg-gray-700 rounded-lg p-6">
                                    <button
                                        onClick={() => removeContentSection(section.id)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    {renderContentSection(section)}
                                </div>
                            ))}

                            {/* Add Section Button */}
                            <div className="relative inline-block">
                                <button
                                    type="button"
                                    onClick={() => setShowAddMenu(!showAddMenu)}
                                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Content Section</span>
                                </button>

                                {showAddMenu && (
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
                                                <Icon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
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
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-gray-900 px-8 py-4 flex justify-end space-x-4">
                        <button
                            onClick={() => setShowLessonModal(false)}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLessonSubmit}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add Lesson
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 