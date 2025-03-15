import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';
import { CheckCircle } from 'lucide-react';

const CourseView = () => {
  const { courseId } = useParams();
  const [hasAccess, setHasAccess] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const checkCourseAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setHasAccess(false);
          return;
        }
        
        const response = await fetch(`${API_URL}/api/courses/check-access/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setHasAccess(data.hasAccess);
          setIsEnrolled(!!data.enrollmentDate);
          if (data.hasAccess) {
            console.log('User has access to this course');
          } else {
            console.log('User needs to purchase this course');
          }
        }
      } catch (error) {
        console.error('Error checking course access:', error);
      }
    };
    
    // Call the function
    checkCourseAccess();
  }, [courseId]);

  return (
    <div>
      {isEnrolled && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>You've enrolled in this course on {new Date(data.enrollmentDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView; 