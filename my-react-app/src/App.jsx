import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/admin/AdminRoute';
import AdminLogin from './components/admin/AdminLogin';
import AppContent from './AppContent';
import BlogList from './Pages/BlogList';
import BlogDetail from './Pages/BlogDetail';
import Courses from './Pages/Courses';
import CourseDetail from './Pages/CourseDetail';
import LessonView from './Pages/LessonView';
import Help from './Pages/Help';
import CreateCourse from './components/admin/CourseManagement/CreateCourse';
import CourseList from './components/admin/CourseManagement/CourseList';
import AdminCourseView from './components/admin/CourseManagement/AdminCourseView';
import EditCourse from './components/admin/CourseManagement/EditCourse';
import TDCLabs from './Pages/TDCLabs';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin/*" element={<AdminRoute />} />
                    
                    {/* Blog Routes */}
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    
                    {/* Course Routes */}
                    <Route path="/course" element={<Courses />} />
                    <Route path="/course/:id" element={<CourseDetail />} />
                    <Route path="/course/:courseId/modules/:moduleId/lessons/:lessonId" element={<LessonView />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/admin/course/create" element={<CreateCourse />} />
                    <Route path="/admin/course" element={<CourseList />} />
                    <Route path="/admin/course/view/:id" element={<AdminCourseView />} />
                    <Route path="/admin/course/edit/:id" element={<EditCourse />} />
                    <Route path="/lab" element={<TDCLabs />} />
                    <Route path="/*" element={<AppContent />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
