'use client'

import { useUpdateStatus } from '@/services/hooks/documents/useUploadPdf'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import {
  useCreateDocument,
  useUpdateDocument,
} from '@/services/hooks/documents/useCreateDocument'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import AddFieldsFormPartial from '../formSteps/AddFieldsFormPartial'
import AddSettingsFormPartial from '../formSteps/AddSettingsFormPartial'
import { useUploadPdf } from '@/services/hooks/documents/useUploadPdf'
import AddSignersFormPartial from '../formSteps/AddSignersFormPartial'
import { AddSubjectFormPartial } from '../formSteps/AddSubjectFormPartial'
import { DocumentFlowFormContainer } from '../formSteps/DocumentFlowRoot'
import { cn } from '../lib/ClsxConnct'
import { PDFViewer } from '../PDFViewer'
import { DocumentStatus } from '../schema/types'
import { Card, CardContent } from '../ui/card'
import { Stepper } from '../ui/stepper'
import { Document } from '@/type/type'
import { TAddFieldsFormSchema } from '../formSteps/meta/add-fields.types'
import ESignatureStepper from '../common/ESignatureStepper'
import axiosInstance from '@/config/apiConfig'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader, Plus, ArrowRight, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import uploadIcon from '@/assets/icons/upload-icon.png'
import { usePDFContext } from '@/context/PDFContext'

interface DocumentEditFormProps {
  className?: string
  initialDocument: Document
  documentRootPath: string
  fileType?: string
  setDocument?: (document: Document) => void
}

// ----------------- API SERVICE HELPERS -----------------
const sendDocument = async (payload: any) => {
  return axiosInstance.post(`/api/v1/files/send-document`, payload)
}

const DocumentEditForm = ({
  className,
  initialDocument,
  fileType,
}: DocumentEditFormProps) => {
  const router = useRouter()
  const { mutateAsync: createDocument } = useCreateDocument()
  const { mutateAsync: updateDocument } = useUpdateDocument()
  const { mutateAsync: uploadPdf } = useUploadPdf()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { mutateAsync: updateStatus } = useUpdateStatus()
  const [successDialog, setSuccessDialog] = useState([])
  const [updateLoading, setUpdateLoading] = useState(false)
  const [document, setDocument] = useState<Document>(initialDocument)
  const [isProcessingNextDoc, setIsProcessingNextDoc] = useState(false)
  const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}')
  const [selectedRecipients, setSelectedRecipients] = useState<
    Document['recipients']
  >(initialDocument?.recipients || [])
  const [loading, setLoading] = useState(false)
  const organizationId = JSON.parse(
    localStorage.getItem('user') || '{}',
  )?.organizationId
  const userTimezone = 'Etc/UTC'
  const { updateStepData, getStepData } = usePDFContext()
  // Get pending documents count
  const [pendingDocsCount, setPendingDocsCount] = useState(0)

  useEffect(() => {
    const updatePendingCount = () => {
      const pending = JSON.parse(
        localStorage.getItem('pendingDocuments') || '[]',
      )
      setPendingDocsCount(pending.length)
    }

    updatePendingCount()
    // Listen for storage changes
    window.addEventListener('storage', updatePendingCount)
    return () => window.removeEventListener('storage', updatePendingCount)
  }, [])

  const allowedFileTypes = `
    application/pdf,
    .pdf,
    application/msword,
    .doc,
    .docm,
    .dot,
    .dotm,
    .dotx,
    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
    .docx,
    text/html,
    .htm,
    .html,
    application/vnd.ms-outlook,
    .msg,
    application/rtf,
    .rtf,
    text/plain,
    .txt,
    application/wordperfect,
    .wpd,
    application/xhtml+xml,
    .xhtml,
    application/vnd.ms-xpsdocument,
    .xps
  `

  // Sync state when initialDocument changes
  useEffect(() => {
    setDocument(initialDocument)
    setSelectedRecipients(initialDocument?.recipients || [])
  }, [initialDocument])

  const onSubmit = async (data: any) => {
    try {
      setLoading(true)

      if (!currentUser?.id || !currentUser?.name) {
        toast.error('Invalid user session. Please log in again.')
        return
      }

      const { emailSettings, ...rest } = data.meta

      // Get the latest form data from step 1 (settings)
      const settingsData = getStepData(1)
      const updatedTitle = settingsData?.title || document.title

      // Update document with the new title
      const updatedDocument = {
        ...document,
        title: updatedTitle,
        documentSignData: {
          ...document.documentSignData,
          '0': {
            ...document.documentSignData?.['0'],
            data: {
              ...document.documentSignData?.['0']?.data,
              title: updatedTitle,
            },
          },
        },
      }

      // Update document state
      setDocument(updatedDocument)

      const sendPayload = {
        documentId: document.id,
        documentName: updatedTitle, // Use the updated title
        recipients: selectedRecipients,
        userId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: 'no-reply@omnisai.io',
        emailMeta: {
          ...rest,
          ...data.meta.emailSettings,
        },
      }

      await sendDocument(sendPayload)

      await updateStatus({
        data: {
          documentId: document.id,
          userId: currentUser.id,
          status: DocumentStatus.PENDING,
        },
      })

      const completedDocs = JSON.parse(
        localStorage.getItem('completedDocs') || '[]',
      )
      completedDocs.push({
        ...sendPayload,
        documentName: updatedTitle,
      })
      localStorage.setItem('completedDocs', JSON.stringify(completedDocs))

      const pending = JSON.parse(
        localStorage.getItem('pendingDocuments') || '[]',
      )
      setPendingDocsCount(pending.length)

      if (pending.length > 0) {
        await handleNextPendingDoc()
      } else {
        setSuccessDialog(completedDocs)
        localStorage.removeItem('completedDocs')
      }
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('Failed to send document:', axiosError.response?.data)
      toast.error(
        axiosError.response?.data?.message || 'Failed to send document',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleNextPendingDoc = async () => {
    const pending = JSON.parse(localStorage.getItem('pendingDocuments') || '[]')
    if (!pending.length) return

    const [nextFile, ...rest] = pending

    try {
      setIsProcessingNextDoc(true)
      toast.loading('Processing next document...', { id: 'next-doc' })

      // Convert object URL back to File
      const response = await fetch(nextFile.url)
      const blob = await response.blob()
      const file = new File([blob], nextFile.name, { type: nextFile.type })

      // API calls like handleUpload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('organizationId', organizationId)
      formData.append('userId', currentUser.id)

      const uploadResponse = await uploadPdf(formData)
      const documentDataId = uploadResponse.data.id || uploadResponse.id || null

      const { id } = await createDocument({
        title: file.name,
        documentDataId,
        timezone: userTimezone,
        userId: currentUser.id,
        teamId: null,
        organizationId,
        folderId: nextFile.folderId ? Number(nextFile.folderId) : undefined,
      })

      // Update session storage queue
      localStorage.setItem('pendingDocuments', JSON.stringify(rest))
      setPendingDocsCount(rest.length)
      updateStepData(3, [], true)
      toast.success(`Processing: ${file.name}`, { id: 'next-doc' })
      // 🟢 Set temporary state in sessionStorage
      sessionStorage.setItem(
        'navState',
        JSON.stringify({
          from: 'dashboard',
          docId: id,
          redirectToURL: window.location.pathname,
          timestamp: Date.now(),
        }),
      )

      // Navigate to next document
      router.push(`/documents/${encodeURIComponent(id)}/edit`)
    } catch (err) {
      console.error('Error processing pending file:', err)
      toast.error('Error processing pending document', { id: 'next-doc' })
    } finally {
      setIsProcessingNextDoc(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    setSelectedFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null)
  }

  const handleCloseModal = () => {
    setSelectedFile(null)
    setShowUploadModal(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    const formData = new FormData()
    const buffer = await selectedFile.arrayBuffer()
    const blob = new Blob([buffer], { type: selectedFile.type })
    const properFile = new File([blob], selectedFile.name, {
      type: selectedFile.type,
    })
    formData.append('file', properFile)
    formData.append('userId', currentUser.id)
    formData.append('documentId', document.id)

    try {
      setUpdateLoading(true)
      const response = await uploadPdf(formData)
      const documentDataId = response.data.id || response.id || null

      const updatedDocument = await updateDocument({
        documentId: document.id,
        documentDataId,
        id: response.data?.id,
        userId: currentUser.id,
        title: selectedFile.name,
        data: response.data?.data,
        initialData: response.data?.initialData,
        fileType: response.data.fileType,
        pageCount: response.data.pageCount,
      })

      setDocument({
        id: updatedDocument?.data?.id || '',
        title: updatedDocument?.data?.title || '',
        file: updatedDocument?.data?.documentData?.initialData || '',
        recipients: updatedDocument?.data?.recipients || [],
        documentMeta: updatedDocument?.data?.documentMeta || {},
        fileType: updatedDocument?.data?.documentData?.fileType || '',
        status: updatedDocument?.data?.status || '',
      })

      handleCloseModal()
      toast.success('Document uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error uploading file')
    } finally {
      setIsUploading(false)
      setUpdateLoading(false)
    }
  }

  const onAddFieldsFormAutoSave = async (data: any) => {
    console.log(data, 'data')
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  // Get button text based on pending documents
  const getSubmitButtonText = () => {
    if (isProcessingNextDoc) {
      return 'Processing...'
    }
    if (loading) {
      return 'Sending...'
    }
    if (pendingDocsCount > 0) {
      return `Send & Continue (${pendingDocsCount} more)`
    }
    return 'Send Document'
  }

  return (
    <>
      <div className={cn('grid grid-cols-12 gap-8 w-full', className)}>
        {/* PDF Viewer */}
        <Card className='relative col-span-12 bg-white rounded-xl lg:col-span-6 xl:col-span-7'>
          <CardContent className='p-6 h-full'>
            {updateLoading ? (
              <div className='flex justify-center items-center h-full'>
                <div className='space-y-3 text-center'>
                  <Loader className='mx-auto w-8 h-8 animate-spin text-primary' />
                  <p className='text-sm text-muted-foreground'>
                    Loading document...
                  </p>
                </div>
              </div>
            ) : (
              <PDFViewer
                file={document.file as ArrayBuffer}
                fileType={fileType}
                className='w-full h-full'
              />
            )}
          </CardContent>
        </Card>

        {/* Form Steps */}
        <div className='relative col-span-12 lg:col-span-6 xl:col-span-5'>
          {/* Pending Documents Banner */}
          {pendingDocsCount > 0 && (
            <div className='flex gap-3 items-center p-3 mb-4 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex-shrink-0'>
                <svg
                  className='w-5 h-5 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-blue-900'>
                  {pendingDocsCount}{' '}
                  {pendingDocsCount === 1 ? 'document' : 'documents'} waiting in
                  queue
                </p>
                <p className='text-xs text-blue-700'>
                  Complete this one to continue to the next
                </p>
              </div>
            </div>
          )}

          <DocumentFlowFormContainer
            className=''
            onSubmit={(e) => e.preventDefault()}
          >
            <Stepper currentStep={1}>
              <AddSettingsFormPartial
                setShowUploadModal={setShowUploadModal}
                document={document}
                setDocument={setDocument}
              />
              <AddSignersFormPartial
                setSelectedRecipients={setSelectedRecipients}
                recipients={selectedRecipients}
                documentId={document.id}
              />
              <AddFieldsFormPartial
                recipients={selectedRecipients}
                onAutoSave={onAddFieldsFormAutoSave}
              />
              <AddSubjectFormPartial
                key={4}
                isSubmitting={loading || isProcessingNextDoc}
                document={document}
                recipients={selectedRecipients}
                onSubmit={onSubmit}
                submitButtonText={getSubmitButtonText()}
                submitButtonIcon={
                  isProcessingNextDoc ? (
                    <Loader className='w-4 h-4 animate-spin' />
                  ) : pendingDocsCount > 0 ? (
                    <ArrowRight className='w-4 h-4' />
                  ) : null
                }
              />
            </Stepper>
          </DocumentFlowFormContainer>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <p className='text-sm text-muted-foreground'>
              Attach files & images related to client document
            </p>
          </DialogHeader>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`border-2 relative flex flex-col items-center justify-center bg-primary/5 rounded-md p-8 text-center cursor-pointer transition ${
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 border-dashed'
            }`}
          >
            <Image src={uploadIcon} alt='Upload' width={50} height={50} />
            <p className='mb-2 text-blue-950 mt-2.5'>
              {selectedFile ? (
                `Selected File: ${selectedFile.name}`
              ) : (
                <div className='font-medium'>
                  Drag and drop your files here or click to{' '}
                  <span className='font-semibold text-blue-600'>Browse</span>
                </div>
              )}
            </p>
            <input
              type='file'
              accept={allowedFileTypes}
              onChange={handleFileSelect}
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            />
            <div className='text-sm underline text-[#787878]'>
              Docx, Word, PDF (Max 250 MB)
            </div>
          </div>

          <DialogFooter className='flex gap-2 justify-end mt-4'>
            <Button
              variant='outline'
              onClick={handleCloseModal}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <div className='flex gap-2 items-center'>
                  <Loader className='w-4 h-4 animate-spin' /> Uploading...
                </div>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialog.length > 0}
        className='sm:max-w-xl'
        onOpenChange={() => setSuccessDialog([])}
      >
        <DialogContent className='!space-y-0.5 sm:max-w-xl gap-2.5'>
          <DialogHeader>
            <svg
              width='48'
              height='48'
              viewBox='0 0 48 48'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect
                width='48'
                height='48'
                rx='24'
                fill='#2F9449'
                fillOpacity='0.1'
              />
              <rect
                x='0.5'
                y='0.5'
                width='47'
                height='47'
                rx='23.5'
                stroke='#2F9449'
                strokeOpacity='0.1'
              />
              <path
                d='M33.3751 25.1248C32.6251 28.8748 29.7978 32.4052 25.8291 33.1947C21.8604 33.9841 17.8331 32.1381 15.8406 28.6162C13.848 25.0944 14.3399 20.6916 17.0606 17.6964C19.7813 14.7011 24.3751 13.8748 28.1251 15.3748'
                stroke='#2F9449'
                strokeWidth='2.25'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M20.625 23.625L24.375 27.375L33.375 17.625'
                stroke='#2F9449'
                strokeWidth='2.25'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>

            <DialogTitle>
              {Array.isArray(successDialog) && successDialog.length > 1
                ? 'All Documents Sent Successfully!'
                : 'Document Sent Successfully'}
            </DialogTitle>
            <p className='text-sm text-muted-foreground'>
              Your documents have been distributed to all selected recipients.
            </p>
          </DialogHeader>

          {/* Loop through all sent docs */}
          {Array.isArray(successDialog) && successDialog.length > 0 && (
            <div className='space-y-4 max-h-[400px] overflow-y-auto'>
              {successDialog.map((doc: any, i: any) => (
                <div key={i} className='space-y-2 bg-gray-50 rounded-lg'>
                  <div className='flex justify-between items-center'>
                    <h3 className='text-base font-semibold text-color-title'>
                      {doc.documentName}
                    </h3>
                    {doc.recipients?.length > 0 && (
                      <div className='text-sm bg-[#EAECF0] py-1 px-2.5 rounded-md text-[#667085]'>
                        {doc.recipients.length} Recipients
                      </div>
                    )}
                  </div>

                  <div className='grid grid-cols-2 gap-1.5'>
                    {doc.recipients?.map((recipient: any) => (
                      <div
                        key={recipient.id}
                        className='flex gap-2 border rounded-md py-2 pl-3 pr-1.5 text-[#787878] items-center'
                      >
                        <svg
                          width='20'
                          height='20'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M5 20C4.2 20 3.44 19.68 2.88 19.12C2.32 18.56 2 17.8 2 17V7C2 6.2 2.32 5.44 2.88 4.88C3.44 4.32 4.2 4 5 4H19C19.8 4 20.56 4.32 21.12 4.88C21.68 5.44 22 6.2 22 7V17C22 17.8 21.68 18.56 21.12 19.12C20.56 19.68 19.8 20 19 20H5ZM12 11.5L6 8H18L12 11.5Z'
                            fill='#787878'
                          />
                        </svg>
                        <p className='text-sm truncate text-muted-foreground'>
                          {recipient.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='flex gap-2 rounded-md items-center border border-[#E2EDFF] py-2 pl-3 pr-1.5 bg-[#F4F8FF]'>
            <div>
              <svg
                width='32'
                height='32'
                viewBox='0 0 32 32'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <rect
                  width='32'
                  height='32'
                  rx='16'
                  fill='#3353F8'
                  fill-opacity='0.16'
                />
                <rect
                  x='0.5'
                  y='0.5'
                  width='31'
                  height='31'
                  rx='15.5'
                  stroke='#3353F8'
                  stroke-opacity='0.1'
                />
                <g clip-path='url(#clip0_162_2143)'>
                  <path
                    fill-rule='evenodd'
                    clip-rule='evenodd'
                    d='M9.07149 20.1184L14.8362 10.4944C14.9576 10.2944 15.1285 10.1291 15.3324 10.0144C15.5362 9.89963 15.7662 9.83936 16.0001 9.83936C16.2341 9.83936 16.464 9.89963 16.6679 10.0144C16.8718 10.1291 17.0426 10.2944 17.164 10.4944L22.9288 20.1184C23.0475 20.3242 23.1104 20.5576 23.111 20.7952C23.1116 21.0329 23.05 21.2666 22.9323 21.4731C22.8146 21.6795 22.645 21.8516 22.4401 21.9722C22.2353 22.0927 22.0025 22.1576 21.7649 22.1603H10.2354C9.99764 22.1578 9.76469 22.0931 9.55973 21.9726C9.35477 21.8521 9.18497 21.68 9.06723 21.4735C8.94949 21.2669 8.88793 21.0331 8.88868 20.7953C8.88943 20.5576 8.95246 20.3242 9.07149 20.1184ZM16.0001 13.5842C16.2168 13.5842 16.4245 13.6703 16.5777 13.8234C16.7308 13.9766 16.8169 14.1844 16.8169 14.401V16.8513C16.8169 17.0679 16.7308 17.2757 16.5777 17.4288C16.4245 17.582 16.2168 17.6681 16.0001 17.6681C15.7835 17.6681 15.5758 17.582 15.4226 17.4288C15.2694 17.2757 15.1834 17.0679 15.1834 16.8513V14.401C15.1834 14.1844 15.2694 13.9766 15.4226 13.8234C15.5758 13.6703 15.7835 13.5842 16.0001 13.5842ZM15.1834 19.3016C15.1834 19.085 15.2694 18.8772 15.4226 18.7241C15.5758 18.5709 15.7835 18.4848 16.0001 18.4848H16.0067C16.2233 18.4848 16.431 18.5709 16.5842 18.7241C16.7374 18.8772 16.8234 19.085 16.8234 19.3016C16.8234 19.5182 16.7374 19.726 16.5842 19.8791C16.431 20.0323 16.2233 20.1184 16.0067 20.1184H16.0001C15.7835 20.1184 15.5758 20.0323 15.4226 19.8791C15.2694 19.726 15.1834 19.5182 15.1834 19.3016Z'
                    fill='#3353F8'
                  />
                </g>
                <defs>
                  <clipPath id='clip0_162_2143'>
                    <rect
                      width='14'
                      height='16'
                      fill='white'
                      transform='translate(9 8)'
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div>
              <h4 className='text-sm font-semibold text-color-title'>
                Documents Secured
              </h4>
              <p className='text-xs text-muted-foreground'>
                All documents are encrypted and ready for signatures with full
                audit trail.
              </p>
            </div>
          </div>

          <DialogFooter className='flex gap-2 justify-end mt-4'>
            <Button onClick={goToDashboard}>
              <CheckCircle2 className='mr-2 w-4 h-4' />
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DocumentEditForm
