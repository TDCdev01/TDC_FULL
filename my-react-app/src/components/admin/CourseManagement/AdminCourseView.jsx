import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, ChevronRight } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../common/LoadingSpinner';

export default function AdminCourseView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModuleIndex, setOpenModuleIndex] = useState(0);

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
            console.error('Error fetching course details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !course) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-300 font-medium">Loading course details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="flex items-center text-gray-300 hover:text-white mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Courses
                </button>

                {/* Course Header */}
                <div className="bg-[#1e293b] rounded-xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <div className="flex items-center space-x-4">
                            <span className="px-4 py-2 bg-blue-600 rounded-lg">{course.level}</span>
                            <span className="px-4 py-2 bg-green-600 rounded-lg">{course.category}</span>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg mb-6">{course.description}</p>
                    
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-[#334155] p-4 rounded-lg">
                            <div className="text-2xl font-bold">{course.duration}</div>
                            <div className="text-gray-400">Duration</div>
                        </div>
                        <div className="bg-[#334155] p-4 rounded-lg">
                            <div className="text-2xl font-bold">{course.students}</div>
                            <div className="text-gray-400">Students</div>
                        </div>
                        <div className="bg-[#334155] p-4 rounded-lg">
                            <div className="text-2xl font-bold">{course.rating}</div>
                            <div className="text-gray-400">Rating</div>
                        </div>
                        <div className="bg-[#334155] p-4 rounded-lg">
                            <div className="text-2xl font-bold">{course.reviews}</div>
                            <div className="text-gray-400">Reviews</div>
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="bg-[#1e293b] rounded-xl p-8">
                    <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                    <div className="space-y-4">
                        {course.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="bg-[#334155] rounded-xl overflow-hidden">
                                <div 
                                    className="p-6 cursor-pointer hover:bg-[#3e4a61] transition-colors"
                                    onClick={() => setOpenModuleIndex(openModuleIndex === moduleIndex ? null : moduleIndex)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Module {moduleIndex + 1}: {module.title}
                                            </h3>
                                            <p className="text-gray-400">{module.duration}</p>
                                        </div>
                                        <ChevronRight 
                                            className={`w-5 h-5 transition-transform ${openModuleIndex === moduleIndex ? 'transform rotate-90' : ''}`}
                                        />
                                    </div>
                                </div>
                                
                                {openModuleIndex === moduleIndex && (
                                    <div className="border-t border-[#1e293b]">
                                        <div className="p-6 space-y-3">
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                <div key={lessonIndex} className="flex items-center justify-between p-4 bg-[#1e293b] rounded-lg">
                                                    <div className="flex items-center">
                                                        <PlayCircle className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <div className="font-medium">{lesson.title}</div>
                                                            <div className="text-sm text-gray-400">{lesson.duration}</div>
                                                        </div>
                                                    </div>
                                                    {lesson.isLocked && (
                                                        <div className="text-gray-400">🔒 Locked</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 