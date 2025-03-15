import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/config';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, Calendar, Clock, Award } from 'lucide-react';

const LearningDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Add this debugging to check token validity
    try {
      // This can help debug token issues
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Dashboard token contains:', {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        exp: new Date(decoded.exp * 1000).toLocaleString()
      });
      
      // More robust check for token fields
      if (!decoded.userId && !decoded.id) {
        console.error('Token is missing user identifier');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }

    fetchUserEnrollments();
  }, [navigate]);

  const fetchUserEnrollments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      console.log('Using token for dashboard:', token.substring(0, 15) + '...');
      
      const response = await fetch(`${API_URL}/api/enrollments/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        console.error('Authorization failed. Token might be invalid.');
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login'); // Redirect to login
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Enrollments loaded:', data.enrollments.length);
        setEnrollments(data.enrollments);
      } else {
        setError(data.message || 'Failed to load your courses');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Error loading your courses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (enrollment) => {
    // This will be enhanced later with actual progress tracking
    return enrollment.progress || 0;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track your progress and continue learning where you left off
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mb-4">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                You haven't enrolled in any courses yet
              </h2>
              <p className="text-gray-600 mb-6">
                Explore our catalog to find courses that match your interests and career goals
              </p>
              <Link
                to="/courses"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={enrollment.course.image || '/default-course-image.jpg'}
                      alt={enrollment.course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-lg font-semibold text-white">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {enrollment.course.instructor?.name || 'Instructor'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{calculateProgress(enrollment)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${calculateProgress(enrollment)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Enrolled on {formatDate(enrollment.completedAt || enrollment.createdAt)}</span>
                    </div>

                    <Link
                      to={`/course/${enrollment.course._id}`}
                      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LearningDashboard; 