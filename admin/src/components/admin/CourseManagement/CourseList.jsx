import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, BookOpen, Eye } from 'lucide-react';
import { API_URL } from '../../../config/config';
import LoadingSpinner from '../../../common/LoadingSpinner';

export default function CourseList() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            console.log('Fetching courses with token:', token); // Debug log

            const response = await fetch(`${API_URL}/api/courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Courses data:', data); // Debug log

            if (data.success) {
                setCourses(data.courses);
            } else {
                throw new Error(data.message || 'Failed to fetch courses');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError(error.message);
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
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
                        Error: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Manage Courses</h1>
                    <button
                        onClick={() => navigate('/course/create')}
                        className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Course
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="bg-[#1e293b] rounded-xl p-8 text-center">
                        <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No Courses Yet</h2>
                        <p className="text-gray-400 mb-4">Get started by creating your first course</p>
                        <button
                            onClick={() => navigate('/course/create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Course
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {courses.map((course) => (
                            <div key={course._id} className="bg-[#1e293b] rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{course.title}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {course.modules?.length || 0} modules • {course.level}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => navigate(`/course/view/${course._id}`)}
                                            className="p-2 text-gray-400 hover:text-white transition-colors"
                                            title="View course"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/course/edit/${course._id}`)}
                                            className="p-2 text-gray-400 hover:text-white transition-colors"
                                            title="Edit course"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            disabled={isDeleting === course._id}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
    );
} 