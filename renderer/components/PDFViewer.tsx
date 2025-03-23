import React, { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/TextLayer.css"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"

interface PDFViewerProps {
  filePath: string
  onClose: () => void
}

export function PDFViewer({ filePath, onClose }: PDFViewerProps) {
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null)
        const dataUrl = await window.ipc.pdfLoader.loadPdf(filePath)
        setPdfData(dataUrl)
      } catch (err) {
        console.error("Failed to load PDF:", err)
        setError("Failed to load PDF")
      }
    }

    loadPdf()
  }, [filePath])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const goToPrevPage = () => {
    setPageNumber((page) => Math.max(page - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((page) => Math.min(page + 1, numPages || 1))
  }

  const zoomIn = () => {
    setScale((scale) => Math.min(scale + 0.2, 3))
  }

  const zoomOut = () => {
    setScale((scale) => Math.max(scale - 0.2, 0.6))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center">
          <h2 className="text-sm text-white font-medium truncate max-w-md">
            {filePath}
          </h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-primary/20 text-gray-400"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center p-2 border-b border-zinc-800">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="p-1.5 rounded hover:bg-primary/20 text-gray-400 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm text-white mx-2">
          Page {pageNumber} of {numPages || "--"}
        </div>
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= (numPages || 1)}
          className="p-1.5 rounded hover:bg-primary/20 text-gray-400 disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
        <div className="border-l border-zinc-700 mx-2 h-5"></div>
        <button
          onClick={zoomOut}
          className="p-1.5 rounded hover:bg-primary/20 text-gray-400"
        >
          <ZoomOut size={16} />
        </button>
        <div className="text-sm text-white mx-2">
          {Math.round(scale * 100)}%
        </div>
        <button
          onClick={zoomIn}
          className="p-1.5 rounded hover:bg-primary/20 text-gray-400"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {error ? (
        <div className="text-white bg-red-500 p-4 rounded-md m-4">{error}</div>
      ) : pdfData ? (
        <div className="w-full h-full overflow-auto flex items-center justify-center bg-zinc-900">
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) =>
              setError(`Error loading document: ${error.message}`)
            }
            className="pdf-document"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      ) : (
        <div className="text-white p-4 flex items-center justify-center">
          Loading PDF...
        </div>
      )}
    </div>
  )
}
