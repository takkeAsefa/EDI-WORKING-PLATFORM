import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize2,
  Eye,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentViewer = ({ file, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (file) {
      // Create object URL for file preview
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      
      // Cleanup URL when component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Eye className="text-gray-400 mx-auto mb-4" />
          {/* <p className="text-gray-500">Select a file to view</p> */}
        </div>
      </div>
    );
  }

  const isImage = file.type==='image/';
  const isPDF = file.type === 'application/pdf';
  const isText = file.type === 'text/plain';

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderImageViewer = () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
      <img
        src={fileUrl}
        alt={file.name}
        style={{
          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
          maxWidth: '100%',
          maxHeight: '100%',
          transition: 'transform 0.3s ease'
        }}
        className="object-contain"
      />
    </div>
  );

  const renderPDFViewer = () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
      <div className="text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">PDF Preview</p>
        <p className="text-sm text-gray-500 mb-4">
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Full PDF viewing requires a PDF viewer plugin or external application
        </p>
        <Button onClick={handleDownload} className="mt-2">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );

  const renderTextViewer = () => {
    const [textContent, setTextContent] = useState('');

    useEffect(() => {
      if (file && isText) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTextContent(e.target.result);
        };
        reader.readAsText(file);
      }
    }, [file]);

    return (
      <div className="bg-white rounded-lg p-6 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
          {textContent}
        </pre>
      </div>
    );
  };

  const renderDocumentViewer = () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
      <div className="text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Document Preview</p>
        <p className="text-sm text-gray-500 mb-4">
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
        <p className="text-xs text-gray-400 mb-4">
          This document type requires external software to view
        </p>
        <Button onClick={handleDownload} className="mt-2">
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </div>
    </div>
  );

  const renderViewer = () => {
    if (isImage) return renderImageViewer();
    if (isPDF) return renderPDFViewer();
    if (isText) return renderTextViewer();
    return renderDocumentViewer();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-0 z-50' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {isImage ? '🖼️' : isPDF ? '📄' : '📄'}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 truncate max-w-xs">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isImage && (
            <>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Viewer Content */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-96'} p-4`}>
        {renderViewer()}
      </div>

      {/* Footer with navigation (for multi-page documents) */}
      {isPDF && (
        <div className="flex items-center justify-center space-x-4 p-4 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
