'use client'

import { usePDFContext } from '@/context/PDFContext'
import { useCreateDocument } from '@/services/hooks/documents/useCreateDocument'
import { useUploadPdf } from '@/services/hooks/documents/useUploadPdf'
import { Loader, Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import uploadIcon from '@/assets/icons/upload-icon.png'

export const ActionButtons = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const router = useRouter()
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id
  const organizationId = JSON.parse(localStorage.getItem('user') || '{}')?.organizationId

  const { mutateAsync: uploadPdf } = useUploadPdf()
  const { updateStepData, setDocId } = usePDFContext()
  const { mutateAsync: createDocument } = useCreateDocument()

  const userTimezone = 'Etc/UTC'
  const { folderId } = useParams()

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

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    setSelectedFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    const formData = new FormData()
    const buffer = await selectedFile.arrayBuffer()
    const blob = new Blob([buffer], { type: selectedFile.type })
    const properFile = new File([blob], selectedFile.name, { type: selectedFile.type })
    formData.append('file', properFile)
    formData.append('organizationId', organizationId)
    formData.append('userId', userId)

    try {
      debugger
      const response = await uploadPdf(formData)
      
      const documentDataId = response.data.id || response.id || null

      const { id } = await createDocument({
        title: selectedFile.name,
        documentDataId,
        timezone: userTimezone,
        userId,
        teamId: null,
        organizationId,
        folderId: folderId ?? undefined,
      })

      setDocId(id)
      updateStepData(1, { title: selectedFile.name, documentDataId: id })
          // 🟢 Set temporary state in sessionStorage
          sessionStorage.setItem('navState', JSON.stringify({
            from: 'dashboard',
            docId: row.id,
            redirectToURL : window.location.pathname,
            timestamp: Date.now(),
          }))
      
      router.push(`/documents/${encodeURIComponent(id)}/edit`)
      handleCloseModal()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedFile(null)
    setShowUploadModal(false)
  }

  return (
    <>
      <button
        className='inline-flex justify-center items-center px-4 py-2 h-10 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50'
        onClick={() => setShowUploadModal(true)}
      >
        <Plus className='w-4 h-4' />
        Add New Document
      </button>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <p className='text-sm text-muted-foreground'>Attach files & images related to client document</p>
          </DialogHeader>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`border-2 relative flex flex-col items-center justify-center bg-primary/5 rounded-md p-8 text-center cursor-pointer transition ${
              dragOver ? 'border-primary bg-primary/10' : 'border-gray-300 border-dashed'
            }`}
          >
            <Image src={uploadIcon} alt="Upload" width={50} height={50} />
            <p className='mb-2 text-blue-950 mt-2.5'>
              {selectedFile
                ? `Selected File: ${selectedFile.name}`
                : <div className='font-medium'>Drag and drop your files here or click to <span className='font-semibold text-blue-600'>Browse</span></div>}
            </p>
            <input
              type='file'
              accept={allowedFileTypes}
              onChange={handleFileSelect}
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            />
            <div className='text-sm underline text-[#787878]'>Docx, Word, PDF (Max 250 MB)</div>
          </div>

          <DialogFooter className='flex gap-2 justify-end mt-4'>
            <Button variant='outline' onClick={handleCloseModal} disabled={isUploading}>
              Cancel
            </Button>
            <Button disabled={!selectedFile || isUploading} onClick={handleUpload}>
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
    </>
  )
}
