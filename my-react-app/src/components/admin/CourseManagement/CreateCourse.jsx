import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Save, ArrowLeft } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../common/LoadingSpinner';
import { uploadToCloudinary } from '../../../utils/cloudinary';
import CodeEditor from '../../common/CodeEditor';

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
        modules: [
            {
                title: '',
                duration: '',
                lessons: [
                    {
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
                    }
                ]
            }
        ],
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
                navigate('/admin/courses');
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

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin/courses')}
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
                                onClick={() => {
                                    setCourse({
                                        ...course,
                                        modules: [...course.modules, {
                                            title: '',
                                            duration: '',
                                            lessons: []
                                        }]
                                    });
                                }}
                                className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Module
                            </button>
                        </div>

                        {course.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="mb-6 p-4 bg-[#334155] rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Module Title"
                                        value={module.title}
                                        onChange={(e) => {
                                            const newModules = [...course.modules];
                                            newModules[moduleIndex].title = e.target.value;
                                            setCourse({ ...course, modules: newModules });
                                        }}
                                        className="bg-[#1e293b] text-white px-4 py-2 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Duration (e.g., 2 weeks)"
                                        value={module.duration}
                                        onChange={(e) => {
                                            const newModules = [...course.modules];
                                            newModules[moduleIndex].duration = e.target.value;
                                            setCourse({ ...course, modules: newModules });
                                        }}
                                        className="bg-[#1e293b] text-white px-4 py-2 rounded-lg"
                                    />
                                </div>

                                <div className="ml-4 space-y-4">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Lesson Title"
                                                value={lesson.title}
                                                onChange={(e) => {
                                                    const newModules = [...course.modules];
                                                    newModules[moduleIndex].lessons[lessonIndex].title = e.target.value;
                                                    setCourse({ ...course, modules: newModules });
                                                }}
                                                className="w-full bg-[#1e293b] text-white px-4 py-2 rounded-lg"
                                            />
                                            <textarea
                                                placeholder="Lesson Description"
                                                value={lesson.description}
                                                onChange={(e) => {
                                                    const newModules = [...course.modules];
                                                    newModules[moduleIndex].lessons[lessonIndex].description = e.target.value;
                                                    setCourse({ ...course, modules: newModules });
                                                }}
                                                className="w-full bg-[#1e293b] text-white px-4 py-2 rounded-lg h-24"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Duration (e.g., 45 min)"
                                                    value={lesson.duration}
                                                    onChange={(e) => {
                                                        const newModules = [...course.modules];
                                                        newModules[moduleIndex].lessons[lessonIndex].duration = e.target.value;
                                                        setCourse({ ...course, modules: newModules });
                                                    }}
                                                    className="bg-[#1e293b] text-white px-4 py-2 rounded-lg"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Video URL"
                                                    value={lesson.videoUrl}
                                                    onChange={(e) => {
                                                        const newModules = [...course.modules];
                                                        newModules[moduleIndex].lessons[lessonIndex].videoUrl = e.target.value;
                                                        setCourse({ ...course, modules: newModules });
                                                    }}
                                                    className="bg-[#1e293b] text-white px-4 py-2 rounded-lg"
                                                />
                                            </div>

                                            {/* Text Content */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Lesson Text Content</label>
                                                <textarea
                                                    value={lesson.content?.text || ''}
                                                    onChange={(e) => {
                                                        const newModules = [...course.modules];
                                                        if (!newModules[moduleIndex].lessons[lessonIndex].content) {
                                                            newModules[moduleIndex].lessons[lessonIndex].content = {};
                                                        }
                                                        newModules[moduleIndex].lessons[lessonIndex].content.text = e.target.value;
                                                        setCourse({ ...course, modules: newModules });
                                                    }}
                                                    className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg h-32"
                                                    placeholder="Enter lesson content..."
                                                />
                                            </div>

                                            {/* Code Content */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Code Snippet</label>
                                                <div className="mb-2">
                                                    <select
                                                        value={lesson.content?.codeLanguage || 'javascript'}
                                                        onChange={(e) => {
                                                            const newModules = [...course.modules];
                                                            if (!newModules[moduleIndex].lessons[lessonIndex].content) {
                                                                newModules[moduleIndex].lessons[lessonIndex].content = {};
                                                            }
                                                            newModules[moduleIndex].lessons[lessonIndex].content.codeLanguage = e.target.value;
                                                            setCourse({ ...course, modules: newModules });
                                                        }}
                                                        className="bg-[#334155] text-white px-4 py-2 rounded-lg"
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
                                                    value={lesson.content?.code || ''}
                                                    language={lesson.content?.codeLanguage || 'javascript'}
                                                    onChange={(value) => {
                                                        const newModules = [...course.modules];
                                                        if (!newModules[moduleIndex].lessons[lessonIndex].content) {
                                                            newModules[moduleIndex].lessons[lessonIndex].content = {};
                                                        }
                                                        newModules[moduleIndex].lessons[lessonIndex].content.code = value;
                                                        setCourse({ ...course, modules: newModules });
                                                    }}
                                                />
                                            </div>

                                            {/* Images */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Images</label>
                                                <div className="space-y-2">
                                                    {lesson.images?.map((image, imageIndex) => (
                                                        <div key={imageIndex} className="flex items-center space-x-2">
                                                            <img src={image.url} alt={image.caption} className="w-20 h-20 object-cover rounded" />
                                                            <input
                                                                type="text"
                                                                value={image.caption}
                                                                onChange={(e) => {
                                                                    const newModules = [...course.modules];
                                                                    newModules[moduleIndex].lessons[lessonIndex].images[imageIndex].caption = e.target.value;
                                                                    setCourse({ ...course, modules: newModules });
                                                                }}
                                                                className="flex-1 bg-[#334155] text-white px-4 py-2 rounded-lg"
                                                                placeholder="Image caption"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newModules = [...course.modules];
                                                                    newModules[moduleIndex].lessons[lessonIndex].images.splice(imageIndex, 1);
                                                                    setCourse({ ...course, modules: newModules });
                                                                }}
                                                                className="text-red-500 hover:text-red-400"
                                                            >
                                                                <Minus className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, moduleIndex, lessonIndex)}
                                                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                                    />
                                                </div>
                                            </div>

                                            {/* Downloadable Files */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Downloadable Files</label>
                                                <div className="space-y-2">
                                                    {lesson.downloadableFiles?.map((file, fileIndex) => (
                                                        <div key={fileIndex} className="flex items-center space-x-2">
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                                {file.name}
                                                            </a>
                                                            <span className="text-gray-400">{file.size}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newModules = [...course.modules];
                                                                    newModules[moduleIndex].lessons[lessonIndex].downloadableFiles.splice(fileIndex, 1);
                                                                    setCourse({ ...course, modules: newModules });
                                                                }}
                                                                className="text-red-500 hover:text-red-400"
                                                            >
                                                                <Minus className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileUpload(e, moduleIndex, lessonIndex)}
                                                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleAddLesson(moduleIndex)}
                                        className="flex items-center px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Lesson
                                    </button>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
} 