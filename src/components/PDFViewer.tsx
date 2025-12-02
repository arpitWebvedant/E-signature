'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf'
import { renderAsync } from 'docx-preview'
import { Loader } from 'lucide-react'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { PDF_VIEWER_PAGE_SELECTOR } from './constants/pdf-viewer'
import { convertToPdf } from '@/services/hooks/documents/useConvartToPdf'

// PDF worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

/* ----------------------------- Loader Component ---------------------------- */
const PDFLoader = ({ message = 'Loading document...' }) => (
  <div className="flex flex-col justify-center items-center py-8">
    <Loader className="w-8 h-8 animate-spin" />
    <p className="mt-2 text-sm text-gray-500">{message}</p>
  </div>
)

/* --------------------------- Types --------------------------- */
export type OnDocumentViewerPageClick = (_event: {
  pageNumber: number
  numPages: number
  originalEvent: React.MouseEvent<HTMLDivElement, MouseEvent>
  pageHeight: number
  pageWidth: number
  pageX: number
  pageY: number
}) => void | Promise<void>

type DocumentViewerProps = {
  file: string | ArrayBuffer | Uint8Array
  className?: string
  onPageClick?: OnDocumentViewerPageClick
  fileType?: string
}

/* --------------------------- Main Component --------------------------- */
export const PDFViewer = ({
  file,
  className = '',
  onPageClick,
  fileType,
}: DocumentViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const [numPages, setNumPages] = useState(0)
  const [containerWidth, setContainerWidth] = useState(800)
  const [decodedFile, setDecodedFile] = useState<ArrayBuffer | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const effectiveType = useMemo(() => (fileType ?? 'pdf').toLowerCase(), [fileType])

  /* ---------------------- Resize Listener ---------------------- */
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth)
    }
  
    // Run immediately on mount
    updateWidth()
  
    // Run again after 5 seconds
    // const timeout = setTimeout(updateWidth, 5000)
  
    // Listen to window resize
    window.addEventListener('resize', updateWidth)
  
    return () => {
      // clearTimeout(timeout)
      window.removeEventListener('resize', updateWidth)
    }
  }, [])
  
/* ---------------------- Update containerWidth after PDF render ---------------------- */
useEffect(() => {
  if (!containerRef.current || numPages === 0) return

  const updateWidth = () => {
    if (containerRef.current) setContainerWidth(containerRef.current.clientWidth)
  }

  // Run once after PDF is rendered
  updateWidth()
}, [numPages])

  /* ---------------------- Reset State on File Change ---------------------- */
  useEffect(() => {
    setDecodedFile(null)
    setTextContent(null)
    setError(null)
    setNumPages(0)
    setLoading(true)
  }, [file, effectiveType])

  /* ---------------------- Decode & Convert File ---------------------- */
  useEffect(() => {
    let isMounted = true

    const processFile = async () => {
      if (!file) {
        // setError('No file provided.')
        // setLoading(false)
        return
      }

      try {
        // TEXT-BASED FILES
        if (['txt', 'rtf', 'html', 'xhtml', 'msg', 'wpd'].includes(effectiveType)) {
          let decoded = ''
          if (typeof file === 'string') decoded = atob(file)
          else decoded = new TextDecoder().decode(file instanceof ArrayBuffer ? new Uint8Array(file) : file)

          if (['html', 'xhtml'].includes(effectiveType)) setTextContent(decoded)
          else setTextContent(decoded)

          return
        }

        // UNSUPPORTED FORMAT
        if (effectiveType === 'xps') {
          setError('XPS files are not supported. Please convert to PDF.')
          return
        }
        // DOC/DOCX and variants → decode to ArrayBuffer
        if (['doc', 'docx', 'docm', 'dotm', 'dot'].includes(effectiveType)) {
          let buffer: ArrayBuffer
          if (typeof file === 'string') {
            const binary = atob(file)
            const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
            buffer = bytes.buffer
          } else {
            buffer = file instanceof ArrayBuffer ? file : file.buffer
          }
          if (isMounted) {
            setDecodedFile(buffer)
            setLoading(false)
          }
          return
        }
        // BINARY DOCX/DOC/PDF
        let buffer: ArrayBuffer
        if (typeof file === 'string') {
          const binary = atob(file)
          const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
          buffer = bytes.buffer
        } else {
          buffer = file instanceof ArrayBuffer ? file : file.buffer
        }

        // Non-PDF → Convert to PDF
        if (effectiveType !== 'pdf') {
          const pdfFile = await convertToPdf({ file })
          if (!isMounted) return
          setDecodedFile(pdfFile)
        } else {
          setDecodedFile(buffer)
        }
      } catch (err) {
        if (!isMounted) return
        console.error('File processing error:', err)
        setError('Failed to process file. Please check the format.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    processFile()
    return () => {
      isMounted = false
    }
  }, [file, effectiveType])

  /* ---------------------- Render DOCX ---------------------- */
  useEffect(() => {
    if (
      ['docx', 'doc', 'docm', 'dotm', 'dot'].includes(effectiveType) &&
      decodedFile &&
      containerRef.current
    ) {
      containerRef.current.innerHTML = ''
      renderAsync(decodedFile, containerRef.current, null, {
        className: 'docx',
        inWrapper: false,
        breakPages: true,
      }).catch((err) => {
        console.error('DOCX render error:', err)
        setError('Failed to render DOCX.')
      })
    }
  }, [effectiveType, decodedFile])

  /* ---------------------- PDF Events ---------------------- */
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setError(null)
    setLoading(false)
  }

  const handlePageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pageNumber: number,
  ) => {
    const $page = (event.target as HTMLElement)?.closest(PDF_VIEWER_PAGE_SELECTOR)
    if (!$page || !onPageClick) return

    const { height, width, top, left } = $page.getBoundingClientRect()
    onPageClick({
      pageNumber,
      numPages,
      originalEvent: event,
      pageHeight: height,
      pageWidth: width,
      pageX: event.clientX - left,
      pageY: event.clientY - top,
    })
  }

  /* ---------------------- Renderers ---------------------- */
  if (loading) return <PDFLoader />

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (textContent) {
    return (
      <div className={`react-pdf__Page ${className}`} data-page-number="1">
        <div ref={containerRef} className="p-4 react-pdf__Page__canvas">
          {['html', 'xhtml'].includes(effectiveType) ? (
            <div dangerouslySetInnerHTML={{ __html: textContent }} />
          ) : (
            <pre className="text-sm whitespace-pre-wrap">{textContent}</pre>
          )}
        </div>
      </div>
    )
  }

  if (['doc', 'docx', 'docm', 'dotm', 'dot'].includes(effectiveType)) {
    return (
      <div className={`document-edit-form-page ${className}`}>
         <div className={`react-pdf__Page`} data-page-number='1'>
        <div ref={containerRef} className='react-pdf__Page__canvas'>
        </div>
      </div>
      </div>
  
    )
  }

  return (
    <div ref={containerRef} className={`document-edit-form-page ${className}`}>
      {decodedFile ? (
        <PDFDocument file={decodedFile} onLoadSuccess={onDocumentLoadSuccess} loading={<PDFLoader />}>
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="overflow-hidden rounded border border-gray-200">
                <PDFPage
                  pageNumber={i + 1}
                  width={containerWidth}
                  renderAnnotationLayer
                  renderTextLayer
                  loading={<PDFLoader />}
                  onClick={(e) => handlePageClick(e, i + 1)}
                />
              </div>
              <p className="mt-1 text-xs text-center text-gray-500">
                Page {i + 1} of {numPages}
              </p>
            </div>
          ))}
        </PDFDocument>
      ) : (
        <p className="text-red-500">Failed to load document.</p>
      )}
    </div>
  )
}
