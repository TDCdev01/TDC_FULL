import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer({ url, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.6));

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.substring(url.lastIndexOf('/') + 1);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
          <h3 className="text-white font-medium">PDF Viewer</h3>
        </div>
        
        <div className="flex space-x-4">
          <button onClick={zoomOut} className="text-white hover:text-gray-300">
            <ZoomOut size={20} />
          </button>
          <span className="text-white">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="text-white hover:text-gray-300">
            <ZoomIn size={20} />
          </button>
          <button onClick={downloadPDF} className="text-white hover:text-gray-300">
            <Download size={20} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-900 flex justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => {
            console.error('Error loading PDF:', error);
            setLoading(false);
          }}
          loading={<LoadingSpinner size="large" />}
        >
          <Page 
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
      
      {/* Navigation */}
      {numPages > 1 && (
        <div className="bg-gray-800 p-4 flex justify-center items-center space-x-6">
          <button
            disabled={pageNumber <= 1}
            onClick={previousPage}
            className={`text-white ${pageNumber <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-300'}`}
          >
            <ChevronLeft size={24} />
          </button>
          <p className="text-white">
            Page {pageNumber} of {numPages}
          </p>
          <button
            disabled={pageNumber >= numPages}
            onClick={nextPage}
            className={`text-white ${pageNumber >= numPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-300'}`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
} 