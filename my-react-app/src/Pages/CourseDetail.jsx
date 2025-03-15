import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Book, Clock, Star, ChevronRight, PlayCircle, CheckCircle, 
    BookOpen, Video, Code, Download, Users, MessageCircle, Lock 
} from 'lucide-react';
import { API_URL } from '../config/config';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModuleIndex, setOpenModuleIndex] = useState(0); // Track open module
    const [isPurchased, setIsPurchased] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                
                const response = await fetch(`${API_URL}/api/courses/${id}`, {
                    headers
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setCourse(data.course);
                    setIsPurchased(data.isPurchased);
                    console.log("Course purchase status:", data.isPurchased);
                    
                    // Force unlock all modules/lessons if purchased
                    if (data.isPurchased) {
                        const unlockedCourse = {
                            ...data.course,
                            modules: data.course.modules.map(module => ({
                                ...module,
                                isLocked: false,
                                lessons: module.lessons.map(lesson => ({
                                    ...lesson,
                                    isLocked: false
                                }))
                            }))
                        };
                        setCourse(unlockedCourse);
                    }
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            } finally {
                setLoading(false);
            }
        };
        
        const checkEnrollmentStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const response = await fetch(`${API_URL}/api/enrollments/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.enrollment) {
                        setIsPurchased(true);
                        console.log("Found enrollment with status:", data.enrollment.status);
                    }
                }
            } catch (error) {
                console.error("Error checking enrollment status:", error);
            }
        };
        
        fetchCourseDetails();
        checkEnrollmentStatus();
    }, [id]);

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
            {course && (
                <SEO
                    title={course.title}
                    description={course.description}
                    keywords={`${course.title}, online course, programming, ${course.category}`}
                    image={course.image}
                    url={`https://yourdomain.com/course/${id}`}
                    type="article"
                />
            )}
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

                        {/* Price and Buy Now Button */}
                        <div className="mt-8 flex items-center space-x-4">
                            <div className="text-3xl font-bold text-white">
                                {course.price > 0 ? `₹${course.price}` : 'Free'}
                            </div>
                            {course.price > 0 && (
                                <button 
                                    onClick={() => navigate(`/checkout/${course._id}`)}
                                    className="bg-[#ffd025] text-[#222222] px-8 py-3 rounded-lg font-semibold hover:bg-[#ffd025]/90 transition-all"
                                >
                                    Buy Now
                                </button>
                            )}
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
                        {course.modules.map((module, index) => (
                            <div key={module._id} className="mb-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-[#111827]">
                                        Module {index + 1}: {module.title}
                                    </h3>
                                    {!isPurchased && module.isLocked && (
                                        <span className="text-[#111827] flex items-center">
                                            <Lock className="w-4 h-4 mr-1" />
                                            Locked
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mt-3 space-y-2">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lesson._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-[#111827] mr-3">
                                                    {lessonIndex + 1}.
                                                </span>
                                                <span className="text-[#111827]">{lesson.title}</span>
                                            </div>
                                            
                                            {(!isPurchased && lesson.isLocked) ? (
                                                <span className="text-[#111827] flex items-center text-sm">
                                                    <Lock className="w-4 h-4 mr-1" />
                                                    Locked
                                                </span>
                                            ) : (
                                                <Link 
                                                    to={`/course/${id}/modules/${module._id}/lessons/${lesson._id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Watch
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
} 