import { X } from 'lucide-react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PDFViewer({ url, fileName, onClose }) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {fileName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* PDF Viewer */}
                <div className="h-[calc(90vh-4rem)] bg-gray-100">
                    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                        <Viewer
                            fileUrl={url}
                            plugins={[defaultLayoutPluginInstance]}
                            defaultScale={1}
                            onError={(error) => {
                                console.error('PDF Error:', error);
                                // Show error message to user
                                alert('Error loading PDF. Please try downloading instead.');
                                onClose();
                            }}
                            renderError={(error) => {
                                return (
                                    <div className="text-center p-5">
                                        <p className="text-red-500">Failed to load PDF</p>
                                        <button
                                            className="mt-2 text-blue-600 hover:text-blue-700"
                                            onClick={onClose}
                                        >
                                            Close
                                        </button>
                                    </div>
                                );
                            }}
                        />
                    </Worker>
                </div>
            </div>
        </div>
    );
} 