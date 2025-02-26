import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Book, Clock, Star, ChevronRight, PlayCircle, CheckCircle, 
    BookOpen, Video, Code, Download, Users, MessageCircle 
} from 'lucide-react';
import { API_URL } from '../config/config';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModuleIndex, setOpenModuleIndex] = useState(0); // Track open module

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/api/courses/${id}`);
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
            <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex flex-col items-center justify-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-600 font-medium">Loading course details...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-[#333333] to-[#111827] text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => navigate('/course')}
                            className="text-gray-300 hover:text-white mb-8 flex items-center"
                        >
                            ← Back to Courses
                        </button>

                        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                        <p className="text-xl text-gray-300 mb-8">{course.description}</p>

                        {/* Course Progress */}
                        <div className="mb-8">
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-300">
                                <span>30% Complete</span>
                                <button className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Continue Learning
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                {course.duration}
                            </div>
                            <div className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                {course.students} students
                            </div>
                            <div className="flex items-center">
                                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                                {course.rating}
                            </div>
                            <div className="flex items-center">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                {course.reviews} reviews
                            </div>
                        </div>

                        <div className="mt-8 flex items-center">
                            <img
                                src={course.instructor.image || '/default-avatar.jpg'}
                                alt={course.instructor.name}
                                className="w-12 h-12 rounded-full mr-4"
                            />
                            <div>
                                <div className="font-medium">{course.instructor.name}</div>
                                <div className="text-gray-300">{course.instructor.title}</div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-4 gap-4">
                            {course.resources.map((resource, index) => (
                                <div key={index} className="text-center">
                                    {resource.type === 'video' && <Video className="w-6 h-6 mx-auto mb-2" />}
                                    {resource.type === 'exercise' && <Code className="w-6 h-6 mx-auto mb-2" />}
                                    {resource.type === 'quiz' && <BookOpen className="w-6 h-6 mx-auto mb-2" />}
                                    {resource.type === 'download' && <Download className="w-6 h-6 mx-auto mb-2" />}
                                    <div className="text-2xl font-bold">{resource.count}</div>
                                    <div className="text-sm text-gray-300">{resource.type}s</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-2xl font-bold text-[#111827] mb-6">Course Curriculum</h2>
                    <div className="space-y-4">
                        {course.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div 
                                    className="p-6 cursor-pointer hover:bg-gray-50"
                                    onClick={() => setOpenModuleIndex(openModuleIndex === moduleIndex ? null : moduleIndex)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#111827]">
                                                Module {moduleIndex + 1}: {module.title}
                                            </h3>
                                            <p className="text-gray-500">{module.duration}</p>
                                        </div>
                                        <ChevronRight 
                                            className={`w-5 h-5 transition-transform ${openModuleIndex === moduleIndex ? 'transform rotate-90' : ''}`}
                                        />
                                    </div>
                                </div>
                                
                                {openModuleIndex === moduleIndex && (
                                    <div className="border-t border-gray-100">
                                        <div className="p-6 space-y-2">
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                <div 
                                                    key={lessonIndex} 
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer"
                                                    onClick={() => navigate(`/course/${course._id}/modules/${module._id}/lessons/${lesson._id}`)}
                                                >
                                                    <div className="flex items-center">
                                                        <PlayCircle className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <div className="font-medium text-[#111827]">{lesson.title}</div>
                                                            <div className="text-sm text-gray-500">{lesson.duration}</div>
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
        </>
    );
} 