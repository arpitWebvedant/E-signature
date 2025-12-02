'use client'

import DocumentEditForm from '@/components/documents/DocumentEditForm'
import { usePDFContext } from '@/context/PDFContext'
import { useFetchDocument } from '@/services/hooks/documents/useFetchDocument'
import { Document, DocumentData } from '@/type/type'
import { ChevronLeft, File } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const DocumentEditPage = () => {
  const router = useRouter()

  const { id: documentId, folderId } = useParams<{ id: string; folderId: string }>()
  const { setFields } = usePDFContext()
  const [navState, setNavState] = useState({
    "from": "dashboard",
    "docId": 168,
    "redirectToURL": "/dashboard",
    "timestamp": 1760508085738
})
  const [showDialog, setShowDialog] = useState(true)
  const [closeWarningDialog, setCloseWarningDialog] = useState(false)

  const [document, setDocument] = useState<Document>({
    id: documentId,
    title: '',
    file: '',
    recipients: [],
    documentMeta: {},
    fileType: '',
    status: '',
  })

  let userId = null
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    userId = user?.id
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
  }
  useEffect(() => {
    const stored = sessionStorage.getItem('navState')
    if (stored) {
      setNavState(JSON.parse(stored))
      sessionStorage.removeItem('navState') // optional cleanup
    }
  }, [])
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const pending = JSON.parse(localStorage.getItem('pendingDocuments') || '[]');
  
      if (pending.length > 0) {
        event.preventDefault();
  
        setCloseWarningDialog(true);
  
        history.pushState(null, '', window.location.href);
      }
    };
  
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
console.log(navState,'navState')
  const { data: documentData, isLoading: isDocumentLoading } = useFetchDocument(documentId, userId, folderId)

  useEffect(() => {
    if (documentData?.data) {
      const data = documentData.data as DocumentData
      setFields(data?.documentSignData ?? {})
      setDocument({
        id: data?.id || '',
        // title: data?.title || decodeURIComponent(documentId),
        title: data?.documentSignData?.["0"]?.data?.title?.trim() || data?.title || decodeURIComponent(documentId),
        file: data?.documentData?.initialData || '',
        recipients: data?.recipients || [],
        documentMeta: data?.documentMeta || {},
        fileType: data?.documentData?.fileType || '',
        status: data?.status || '',
      })
    }
  }, [documentId, documentData, folderId, setFields])

  // 🔹 Handle main dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      const pending = JSON.parse(localStorage.getItem('pendingDocuments') || '[]')
      if (pending.length > 0) {
        setCloseWarningDialog(true)
        return
      }
      localStorage.removeItem('completedDocs')
      localStorage.removeItem('pendingDocuments')
      router.push(navState?.redirectToURL)
    }
    setShowDialog(open)
  }

  return (
    <div className="px-4 mx-auto -mt-4 w-full max-w-screen-xl md:px-8">
      <Link href={navState?.redirectToURL} className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="inline-block mr-2 w-5 h-5" />
        <span className='capitalize'>
          {navState?.redirectToURL.split('/').pop()}
        </span>
      </Link>

      <div className="flex justify-between items-end mt-4 w-full">
        <div className="flex-1">
          {isDocumentLoading ? (
            <div className='animate-pulse'>
              <div className='mb-2 w-64 h-7 bg-gray-200 rounded'></div>
              <div className='flex gap-3 items-center'>
                <div className='w-32 h-4 bg-gray-200 rounded'></div>
              </div>
            </div>
          ) : (
            <>
              <h1
                className="block max-w-[20rem] truncate text-2xl font-semibold md:max-w-[30rem] md:text-3xl"
                title={document.title}
              >
                {document.title}
              </h1>
              <div className="mt-2.5 flex items-center gap-x-6">
                <span className="flex items-center text-muted-foreground">
                  <File className="inline-block mr-2 w-4 h-4 text-yellow-500 dark:text-yellow-200" />
                  {document.status}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[80vw] max-h-[calc(100vh-10vh)] min-h-[calc(100vh-50vh)] overflow-hidden relative">
        {/* Fixed Header */}
        <div className="sticky top-0 z-50 bg-background pb-4 border-b -mx-6 -mt-6 px-6 pt-6">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Attach files & images related to client documents
            </p>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-auto max-h-[calc(100vh-20vh)] mt-4">
          {isDocumentLoading ? (
            <div className='grid grid-cols-12 gap-8 w-full animate-pulse'>
              {/* Left PDF viewer placeholder */}
              <div className='col-span-12 lg:col-span-6 xl:col-span-7'>
                <div className='h-[480px] w-full bg-gray-200 rounded-xl border'></div>
              </div>
              {/* Right stepper + forms placeholder */}
              <div className='col-span-12 lg:col-span-6 xl:col-span-5'>
                <div className='space-y-4'>
                  {/* Stepper */}
                  <div className='w-full h-8 bg-gray-200 rounded'></div>
                  {/* General */}
                  <div className='p-4 rounded-xl border'>
                    <div className='mb-3 w-32 h-5 bg-gray-200 rounded'></div>
                    <div className='space-y-2'>
                      <div className='w-full h-10 bg-gray-200 rounded'></div>
                      <div className='w-3/4 h-10 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                  {/* Add Signers */}
                  <div className='p-4 rounded-xl border'>
                    <div className='mb-3 w-28 h-5 bg-gray-200 rounded'></div>
                    <div className='space-y-2'>
                      <div className='w-full h-10 bg-gray-200 rounded'></div>
                      <div className='w-full h-10 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                  {/* Add Fields */}
                  <div className='p-4 rounded-xl border'>
                    <div className='mb-3 w-24 h-5 bg-gray-200 rounded'></div>
                    <div className='w-full h-24 bg-gray-200 rounded'></div>
                  </div>
                  {/* Distribute */}
                  <div className='p-4 rounded-xl border'>
                    <div className='mb-3 w-28 h-5 bg-gray-200 rounded'></div>
                    <div className='space-y-2'>
                      <div className='w-full h-10 bg-gray-200 rounded'></div>
                      <div className='w-2/3 h-10 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <DocumentEditForm
              initialDocument={document}
              fileType={document?.fileType}
              documentRootPath="/"
            />
          )}
        </div>
      </DialogContent>
      </Dialog>

      {/* Close Warning Dialog */}
      <Dialog open={closeWarningDialog} onOpenChange={setCloseWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Upload?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              You still have pending files to upload. If you close now, you will lose them.
            </p>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setCloseWarningDialog(false)}>
              Continue Upload
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem('pendingDocuments')
                localStorage.removeItem('completedDocs')
                setCloseWarningDialog(false)
                setShowDialog(false)
                router.push('/')
              }}
            >
              Discard Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DocumentEditPage
