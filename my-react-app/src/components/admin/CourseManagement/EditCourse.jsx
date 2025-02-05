import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Save, ArrowLeft } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../common/LoadingSpinner';
import { uploadToCloudinary } from '../../../utils/cloudinary';

export default function EditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [course, setCourse] = useState(null);

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
                navigate('/admin/courses');
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
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="flex items-center text-gray-300 hover:text-white mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Courses
                </button>

                <h1 className="text-3xl font-bold mb-8">Edit Course</h1>

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
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={course.description}
                                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                    className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg h-32"
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

                                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                                            placeholder="Duration"
                                            value={module.duration}
                                            onChange={(e) => {
                                                const newModules = [...course.modules];
                                                newModules[moduleIndex].duration = e.target.value;
                                                setCourse({ ...course, modules: newModules });
                                            }}
                                            className="bg-[#1e293b] text-white px-4 py-2 rounded-lg"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <div key={lessonIndex} className="bg-[#1e293b] p-4 rounded-lg">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="font-medium">Lesson {lessonIndex + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newModules = [...course.modules];
                                                            newModules[moduleIndex].lessons = module.lessons.filter(
                                                                (_, idx) => idx !== lessonIndex
                                                            );
                                                            setCourse({ ...course, modules: newModules });
                                                        }}
                                                        className="text-red-500 hover:text-red-400"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Lesson Title"
                                                        value={lesson.title}
                                                        onChange={(e) => {
                                                            const newModules = [...course.modules];
                                                            newModules[moduleIndex].lessons[lessonIndex].title = e.target.value;
                                                            setCourse({ ...course, modules: newModules });
                                                        }}
                                                        className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg"
                                                    />
                                                    <textarea
                                                        placeholder="Lesson Description"
                                                        value={lesson.description}
                                                        onChange={(e) => {
                                                            const newModules = [...course.modules];
                                                            newModules[moduleIndex].lessons[lessonIndex].description = e.target.value;
                                                            setCourse({ ...course, modules: newModules });
                                                        }}
                                                        className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg h-24"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Duration"
                                                            value={lesson.duration}
                                                            onChange={(e) => {
                                                                const newModules = [...course.modules];
                                                                newModules[moduleIndex].lessons[lessonIndex].duration = e.target.value;
                                                                setCourse({ ...course, modules: newModules });
                                                            }}
                                                            className="bg-[#334155] text-white px-4 py-2 rounded-lg"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Video URL"
                                                            value={lesson.videoUrl}
                                                            onChange={(e) => {
                                                                const newModules = [...course.modules];
                                                                newModules[moduleIndex].lessons[lessonIndex].videoUrl = formatYoutubeUrl(e.target.value);
                                                                setCourse({ ...course, modules: newModules });
                                                            }}
                                                            className="bg-[#334155] text-white px-4 py-2 rounded-lg"
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
                                                        <textarea
                                                            value={lesson.content?.code || ''}
                                                            onChange={(e) => {
                                                                const newModules = [...course.modules];
                                                                if (!newModules[moduleIndex].lessons[lessonIndex].content) {
                                                                    newModules[moduleIndex].lessons[lessonIndex].content = {};
                                                                }
                                                                newModules[moduleIndex].lessons[lessonIndex].content.code = e.target.value;
                                                                setCourse({ ...course, modules: newModules });
                                                            }}
                                                            className="w-full bg-[#334155] text-white px-4 py-2 rounded-lg h-32 font-mono"
                                                            placeholder="Enter code snippet..."
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
                                                                onChange={async (e) => {
                                                                    try {
                                                                        const file = e.target.files[0];
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
                                                                        alert('Failed to upload image');
                                                                    }
                                                                }}
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
                                                                onChange={async (e) => {
                                                                    try {
                                                                        const file = e.target.files[0];
                                                                        const url = await uploadToCloudinary(file);
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
                                                                        alert('Failed to upload file');
                                                                    }
                                                                }}
                                                                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newModules = [...course.modules];
                                                newModules[moduleIndex].lessons.push({
                                                    title: '',
                                                    description: '',
                                                    duration: '',
                                                    videoUrl: '',
                                                    isLocked: true
                                                });
                                                setCourse({ ...course, modules: newModules });
                                            }}
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

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="small" />
                                <span className="ml-2">Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
} 