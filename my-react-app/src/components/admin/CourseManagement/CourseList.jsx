import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, BookOpen, Eye } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../common/LoadingSpinner';

export default function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/api/courses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        setIsDeleting(courseId);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setCourses(courses.filter(course => course._id !== courseId));
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
        } finally {
            setIsDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-gray-300 font-medium">Loading courses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center text-gray-300 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/admin/courses/create')}
                        className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Course
                    </button>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                        <h1 className="text-2xl font-bold flex items-center">
                            <BookOpen className="w-6 h-6 mr-2" />
                            Manage Courses
                        </h1>
                    </div>

                    {courses.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No courses found. Create your first course!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-700">
                            {courses.map((course) => (
                                <div key={course._id} className="p-6 hover:bg-gray-750">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                                <p className="text-gray-400 text-sm">
                                                    {course.modules?.length || 0} modules • {course.level}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => navigate(`/admin/courses/view/${course._id}`)}
                                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                                title="View course"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                                title="Edit course"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                disabled={isDeleting === course._id}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                title="Delete course"
                                            >
                                                {isDeleting === course._id ? (
                                                    <LoadingSpinner size="small" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 