import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Download, BookOpen, Image as ImageIcon, X, FileText, Lock, ArrowRight, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config/config';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CodeEditor from '../components/common/CodeEditor';
import PDFViewer from '../components/common/PDFViewer';

export default function LessonView() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [currentPDF, setCurrentPDF] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/courses/${courseId}`);
        const data = await response.json();
        
        if (data.success) {
          setCourse(data.course);
          
          // Find current module and lesson
          const currentModule = data.course.modules.find(m => m._id === moduleId);
          if (!currentModule) {
            console.error('Module not found');
            return;
          }
          setCurrentModule(currentModule);
          
          const currentLesson = currentModule.lessons.find(l => l._id === lessonId);
          if (!currentLesson) {
            console.error('Lesson not found');
            return;
          }
          setCurrentLesson(currentLesson);
          
          // Find next lesson
          const currentLessonIndex = currentModule.lessons.findIndex(l => l._id === lessonId);
          const currentModuleIndex = data.course.modules.findIndex(m => m._id === moduleId);
          
          // Check if there's a next lesson in current module
          if (currentLessonIndex < currentModule.lessons.length - 1) {
            setNextLesson({
              moduleId: currentModule._id,
              lesson: currentModule.lessons[currentLessonIndex + 1]
            });
          }
          // Check if there's a next module with lessons
          else if (currentModuleIndex < data.course.modules.length - 1) {
            const nextModule = data.course.modules[currentModuleIndex + 1];
            if (nextModule.lessons.length > 0) {
              setNextLesson({
                moduleId: nextModule._id,
                lesson: nextModule.lessons[0]
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, moduleId, lessonId]);

  if (loading || !currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] flex flex-col items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 font-medium">Loading lesson...</p>
      </div>
    );
  }

  // Update the video URL formatting function
  const getEmbedUrl = (url) => {
    try {
        // Handle different YouTube URL formats
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
        
        return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
        console.error('Error formatting YouTube URL:', error);
        return '';
    }
  };

  // Update the handleDownload function
  const handleDownload = async (file) => {
    // If it's a PDF, show the viewer
    if (file.name.toLowerCase().endsWith('.pdf')) {
        // Convert Cloudinary URL to a direct download URL if needed
        const pdfUrl = file.url.replace('/upload/', '/upload/fl_attachment/');
        setSelectedPDF({
            ...file,
            url: pdfUrl
        });
        return;
    }

    try {
        setIsDownloading(true);
        const response = await fetch(file.url);
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = file.name;
        
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        try {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.location.href = file.url;
            } else {
                window.location.href = file.url;
            }
        } catch (fallbackError) {
            console.error('Fallback download failed:', fallbackError);
            alert('Download failed. Please try again or contact support.');
        }
    } finally {
        setIsDownloading(false);
    }
  };

  const handlePDFView = (url) => {
    setCurrentPDF(url);
    setShowPDF(true);
  };

  // Function to handle lesson navigation
  const handleLessonClick = (moduleId, lessonId) => {
    navigate(`/course/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
  };

  // Add this function to check if a file exists before displaying
  const checkFileExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking file:', error);
      return false;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        {/* Navigation Header */}
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center  transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Course
          </button>
          <button className="flex items-center  hover:text-gray-900 transition-colors">
            <CheckCircle className="w-5 h-5 mr-2" />
            Mark as Complete
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Video Section */}
                {currentLesson.videoUrl && (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={getEmbedUrl(currentLesson.videoUrl)}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="p-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentLesson.title}
                  </h1>
                  
                  {currentLesson.description && (
                    <p className="text-gray-600 mb-6">{currentLesson.description}</p>
                  )}

                  {/* Content Sections */}
                  <div className="space-y-8">
                    {currentLesson.sections?.map((section, index) => (
                      <div key={index} className="border-t pt-6 first:border-t-0 first:pt-0">
                        {/* Text Section */}
                        {section.type === 'text' && (
                          <div className="prose max-w-none">
                            <p className="text-gray-700">{section.content.text}</p>
                          </div>
                        )}

                        {/* Code Section */}
                        {section.type === 'code' && (
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">
                                {section.content.language}
                              </span>
                            </div>
                            <CodeEditor
                              value={section.content.code}
                              language={section.content.language}
                              readOnly={true}
                            />
                          </div>
                        )}

                        {/* Image Section */}
                        {section.type === 'image' && (
                          <div className="space-y-2">
                            <img
                              src={section.content.url}
                              alt={section.content.caption || 'Lesson image'}
                              className="rounded-lg w-full"
                              onClick={() => setSelectedImage(section.content)}
                            />
                            {section.content.caption && (
                              <p className="text-sm text-gray-500 text-center">
                                {section.content.caption}
                              </p>
                            )}
                          </div>
                        )}

                        {/* File Section */}
                        {section.type === 'file' && (
                          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                            <div className="p-6">
                              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                Downloadable Resource
                              </h3>
                              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-800">{section.content.name}</p>
                                  <p className="text-sm text-gray-600">{section.content.size}</p>
                                </div>
                                <div className="flex space-x-2">
                                  {/* Add a button to retry loading the file if it fails */}
                                  {section.content.url && (
                                    <>
                                      {(section.content.type?.includes('pdf') || 
                                        section.content.name?.toLowerCase().endsWith('.pdf')) && (
                                        <button
                                          onClick={async () => {
                                            console.log("Opening PDF:", section.content.url);
                                            // Check if file exists first
                                            const exists = await checkFileExists(section.content.url);
                                            if (exists) {
                                              setCurrentPDF(section.content.url);
                                              setShowPDF(true);
                                            } else {
                                              alert("The file could not be found. It may have been moved or deleted.");
                                            }
                                          }}
                                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
                                        >
                                          <Eye className="w-4 h-4 mr-2 bg-black" />
                                          View PDF
                                        </button>
                                      )}
                                      <a
                                        href={section.content.url}
                                        download={section.content.name}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                        onClick={async (e) => {
                                          // Check if file exists before trying to download
                                          const exists = await checkFileExists(section.content.url);
                                          if (!exists) {
                                            e.preventDefault();
                                            alert("The file could not be found. It may have been moved or deleted.");
                                          }
                                        }}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Course Navigation Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Course Content
                    </h2>
                    
                    {/* Modules and Lessons List */}
                    <div className="space-y-4">
                      {course?.modules.map((module, moduleIndex) => (
                        <div key={module._id} className="space-y-2">
                          {/* Module Header */}
                          <div className="flex items-center justify-between text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Module {moduleIndex + 1}</span>
                              <span className="text-gray-900">{module.title}</span>
                            </div>
                            {module.duration && (
                              <span className="text-sm text-gray-500">{module.duration}</span>
                            )}
                          </div>

                          {/* Lessons List */}
                          <div className="pl-6 space-y-1">
                            {module.lessons.map((lesson) => (
                              <button
                                key={lesson._id}
                                onClick={() => handleLessonClick(module._id, lesson._id)}
                                className={`w-full flex items-center text-left p-2 rounded-lg transition-colors ${
                                  lesson._id === lessonId 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'bg-blue-50 hover:bg-gray-50 text-gray-600'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center">
                                    {lesson._id === lessonId && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                                    )}
                                    <span className={`truncate ${lesson._id === lessonId ? 'font-medium' : ''}`}>
                                      {lesson.title}
                                    </span>
                                  </div>
                                  {lesson.duration && (
                                    <span className="text-sm text-gray-500 mt-0.5">
                                      {lesson.duration}
                                    </span>
                                  )}
                                </div>
                                {lesson.isLocked && (
                                  <span className="ml-2 text-gray-400">
                                    <Lock className="w-4 h-4" />
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Lesson Card */}
                {nextLesson && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Up</h3>
                      <button
                        onClick={() => handleLessonClick(nextLesson.moduleId, nextLesson.lesson._id)}
                        className="w-full text-left"
                      >
                        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Next Lesson</span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900 line-clamp-2">
                            {nextLesson.lesson.title}
                          </p>
                          {nextLesson.lesson.duration && (
                            <p className="text-sm text-gray-500 mt-1">
                              Duration: {nextLesson.lesson.duration}
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="w-full h-auto"
              />
              {selectedImage.caption && (
                <div className="p-4">
                  <p className="text-gray-700">{selectedImage.caption}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add PDF Viewer Modal */}
      {showPDF && (
        <PDFViewer
          url={currentPDF}
          onClose={() => {
            setShowPDF(false);
            setCurrentPDF(null);
          }}
        />
      )}
    </>
  );
} 