import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Download, BookOpen, Image as ImageIcon, X } from 'lucide-react';
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

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/courses/${courseId}`);
        const data = await response.json();
        
        if (data.success) {
          setCourse(data.course);
          const module = data.course.modules.find(m => m._id === moduleId);
          setCurrentModule(module);
          const lesson = module.lessons.find(l => l._id === lessonId);
          setCurrentLesson(lesson);
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

  // Find next lesson
  const findNextLesson = () => {
    const currentModuleIndex = course.modules.findIndex(m => m._id === moduleId);
    const currentLessonIndex = currentModule.lessons.findIndex(l => l._id === lessonId);

    // Check if there's another lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      return {
        moduleId: moduleId,
        lesson: currentModule.lessons[currentLessonIndex + 1]
      };
    }
    
    // Check if there's another module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        return {
          moduleId: nextModule._id,
          lesson: nextModule.lessons[0]
        };
      }
    }

    return null;
  };

  const nextLesson = findNextLesson();

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        {/* Top Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Course
              </button>
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Video Player */}
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={getEmbedUrl(currentLesson.videoUrl)}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentLesson.title}
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {currentLesson.description}
                  </p>

                  <div className="space-y-6">
                    {/* Text Content */}
                    {currentLesson.content?.text && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lesson Content</h3>
                            <div className="prose prose-blue max-w-none">
                                <p className="text-gray-600 whitespace-pre-wrap">{currentLesson.content.text}</p>
                            </div>
                        </div>
                    )}

                    {/* Code Example */}
                    {currentLesson.content?.code && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Example</h3>
                            <CodeEditor
                                value={currentLesson.content.code}
                                language={currentLesson.content.codeLanguage || 'javascript'}
                                onChange={() => {}} // Read-only for students
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                }}
                            />
                        </div>
                    )}

                    {/* Images */}
                    {currentLesson.images?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Images</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {currentLesson.images.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className="relative group cursor-pointer"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                                            <img 
                                                src={image.url} 
                                                alt={image.caption} 
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                        {image.caption && (
                                            <p className="mt-1 text-sm text-gray-500">{image.caption}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Downloadable Files */}
                    {currentLesson.downloadableFiles?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Downloads</h3>
                            <div className="space-y-2">
                                {currentLesson.downloadableFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Download className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                <p className="text-xs text-gray-500">{file.size}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {file.name.toLowerCase().endsWith('.pdf') && (
                                                <button
                                                    onClick={() => setSelectedPDF(file)}
                                                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                    View
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    setIsDownloading(true);
                                                    try {
                                                        await handleDownload(file);
                                                    } finally {
                                                        setIsDownloading(false);
                                                    }
                                                }}
                                                disabled={isDownloading}
                                                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                {isDownloading ? (
                                                    <LoadingSpinner size="small" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                                {isDownloading ? 'Downloading...' : 'Download'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                {/* Course Navigation */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Course Content
                    </h2>
                    <div className="space-y-4">
                        {course.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="space-y-2">
                                <div className="flex items-center justify-between text-gray-700 font-medium">
                                    <span>Module {moduleIndex + 1}: {module.title}</span>
                                    <span className="text-sm text-gray-500">{module.duration}</span>
                                </div>
                                <div className="pl-4 space-y-1">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div
                                            key={lessonIndex}
                                            onClick={() => navigate(`/courses/${courseId}/modules/${module._id}/lessons/${lesson._id}`)}
                                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                                currentLesson._id === lesson._id
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                        >
                                            <div className="w-5 h-5 mr-3 flex-shrink-0">
                                                {currentLesson._id === lesson._id ? (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                                                ) : (
                                                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{lesson.title}</div>
                                                <div className="text-xs text-gray-500">{lesson.duration}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Next Lesson Card */}
                {nextLesson && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Next Up
                        </h2>
                        <div 
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => navigate(`/courses/${courseId}/modules/${nextLesson.moduleId}/lessons/${nextLesson.lesson._id}`)}
                        >
                            <p className="font-medium text-gray-900 mb-1">
                                {nextLesson.lesson.title}
                            </p>
                            <p className="text-sm text-gray-500">
                                Continue your learning journey
                            </p>
                        </div>
                    </div>
                )}
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
      {selectedPDF && (
          <PDFViewer
              url={selectedPDF.url}
              fileName={selectedPDF.name}
              onClose={() => setSelectedPDF(null)}
          />
      )}
    </>
  );
} 