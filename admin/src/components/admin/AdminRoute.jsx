import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import UserList from './UserList';
import UserDetail from './UserDetail';
import CreateBlogPost from './BlogPost/CreateBlogPost';
import BlogPostList from './BlogPost/BlogPostList';
import EditBlogPost from './BlogPost/EditBlogPost';
import ViewBlogPost from './BlogPost/ViewBlogPost';
import AdminPanel from './AdminPanel';
import CreateCourse from './CourseManagement/CreateCourse';
import CourseList from './CourseManagement/CourseList';
import AdminCourseView from './CourseManagement/AdminCourseView';
import EditCourse from './CourseManagement/EditCourse';

export default function AdminRoute() {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/:userId" element={<UserDetail />} />
        <Route path="create-post" element={<CreateBlogPost />} />
        <Route path="posts" element={<BlogPostList />} />
        <Route path="posts/:postId" element={<ViewBlogPost />} />
        <Route path="edit-post/:postId" element={<EditBlogPost />} />
        <Route path="panel" element={<AdminPanel />} />
        
        {/* Course Management Routes */}
        <Route path="course/create" element={<CreateCourse />} />
        <Route path="course" element={<CourseList />} />
        <Route path="course/view/:id" element={<AdminCourseView />} />
        <Route path="course/edit/:id" element={<EditCourse />} />
        
        {/* Catch-all route redirects to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
} 