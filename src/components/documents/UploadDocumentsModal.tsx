'use client'

import { useCallback, useState } from 'react'
import { Eye, Trash2, Loader } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileRejection, useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { useCreateDocument } from '@/services/hooks/documents/useCreateDocument'
import { usePDFContext } from '@/context/PDFContext'
import { useUploadPdf } from '@/services/hooks/documents/useUploadPdf'
import { useParams, useRouter } from 'next/navigation'

// ✅ Utility to format file size dynamically
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`
}

interface UploadDocumentModalProps {
  showModal: boolean
  setShowModal: (value: boolean) => void
}

const UploadDocumentModal = ({ showModal, setShowModal }: UploadDocumentModalProps) => {
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const router = useRouter()
  const { id: folderId } = useParams()

  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id
  const organizationId = JSON.parse(localStorage.getItem('user') || '{}')?.organizationId
  const userTimezone = 'Etc/UTC'

  const { mutateAsync: uploadPdf } = useUploadPdf()
  const { updateStepData, setDocId } = usePDFContext()
  const { mutateAsync: createDocument } = useCreateDocument()

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      console.error('File rejections:', fileRejections)
      return
    }
    setSelectedFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
    disabled: loading,
  })

  const viewFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file)
    window.open(fileUrl, '_blank')
  }

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    setLoading(true)

    try {
      const [firstFile, ...remainingFiles] = selectedFiles

      if (firstFile) {
        const formData = new FormData()
        formData.append('file', firstFile)
        formData.append('organizationId', organizationId)
        formData.append('userId', userId)

        const response = await uploadPdf(formData)
        const documentDataId = response.data.id || response.id || null

        const { id } = await createDocument({
          title: firstFile.name,
          documentDataId,
          timezone: userTimezone,
          userId,
          teamId: null,
          organizationId,
          folderId: folderId ? Number(folderId) : undefined,
        })

        setDocId(id)
        updateStepData(1, { title: firstFile.name, documentDataId: id })
            // 🟢 Set temporary state in sessionStorage
            sessionStorage.setItem('navState', JSON.stringify({
              from: 'dashboard',
              docId: id,
              redirectToURL : window.location.pathname,
              timestamp: Date.now(),
            }))
        
        router.push(`/documents/${encodeURIComponent(id)}/edit`)
      }

      if (remainingFiles.length > 0) {
        const stored = remainingFiles.map(f => ({
          name: f.name,
          type: f.type,
          folderId: folderId ? Number(folderId) : undefined,
          url: URL.createObjectURL(f),
        }))
        localStorage.removeItem('completedDocs')
        localStorage.setItem('pendingDocuments', JSON.stringify(stored))
        console.log('Saved remaining files for session:', stored)
      } else {
        localStorage.removeItem('pendingDocuments')
        localStorage.removeItem('completedDocs')
      }

      // cleanup
      setSelectedFiles([])
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setLoading(false)
    }
  }



  return (
    <Dialog
      open={showModal}
      onOpenChange={open => {
        if (!loading) {
          setShowModal(open)
        }
      }}
    >
      <DialogContent className="overflow-hidden bg-white rounded-xl shadow-lg">
        <DialogTitle>
          <p className='text-lg font-semibold text-[#181D27] leading-tight'>Upload Documents</p>
          <p className='text-[#535862] text-sm font-normal mt-0.5'>Attach files related to your document</p>
        </DialogTitle>

        <div>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed border-[#E3ECFF] rounded-lg py-8 px-4 sm:px-6 sm:py-13 text-center bg-[#F4F8FF] transition-all duration-300 ease-in-out cursor-pointer hover:border-[#2563eb] hover:bg-[#eff6ff]
              ${isDragActive ? 'border-[#2563eb] bg-[#eff6ff] border-solid' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center gap-[6px]'>
              <Image
                src='/assets/img/upload-folder.svg'
                alt='folder open'
                width={48}
                height={48}
                className='w-8 h-8 sm:w-12 mb-[6px] sm:h-12'
              />
              {isDragActive ? (
                <p className='text-[#111C53] text-sm font-medium'>Drop the files here...</p>
              ) : (
                <>
                  <p className='text-[#111C53] text-sm font-medium'>
                    Drag and drop your files here or{' '}
                    <span className='underline font-semibold cursor-pointer text-[#3353F8]'>
                      Browse
                    </span>
                  </p>
                  <span className='text-xs underline text-[#999999]'>
                    {'Pdf, Docx, Word (Max 250 MB each)'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* File list */}
          <div className='mt-2 space-y-2'>
            {selectedFiles.map(file => (
              <div
                key={file.name}
                className='w-full flex justify-between items-center px-4 py-3 gap-4 bg-[#F9FAFF] rounded-2xl border border-[#E7EBFF]'
              >
                <div className='flex overflow-hidden flex-1 gap-2 items-center text-ellipsis'>
                  {(file.type === 'application/msword' ||
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.name.endsWith('.doc') ||
                    file.name.endsWith('.docx')) ? (
                    <Image src='/assets/img/docx-icon.svg' alt='doc-icon' width={28} height={28} />
                  ) : (
                    <Image src='/assets/img/pdf-icon.svg' alt='doc-icon' width={28} height={28} />
                  )}

                  <div className='flex overflow-hidden flex-col text-ellipsis'>
                    <span className='font-medium text-[#333333] text-sm overflow-hidden text-ellipsis max-w-xs'>
                      {file.name}
                    </span>
                    <span className='text-sm text-[#525862] overflow-hidden text-ellipsis max-w-sm'>
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <div className='flex gap-1'>
                  <button
                    className='bg-none border border-transparent text-zinc-800 cursor-pointer transition-all duration-200 ease-in rounded-sm px-[6px] py-1 hover:bg-zinc-100 hover:border-zinc-400 hover:-translate-y-[1px] hover:shadow hover:shadow-zinc-200/50 disabled:cursor-not-allowed disabled:opacity-60'
                    onClick={() => !loading && viewFile(file)}
                    disabled={loading}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => !loading && removeFile(file.name)}
                    disabled={loading}
                    className='bg-none border border-transparent text-[#dc2626] cursor-pointer transition-all duration-200 ease-in rounded-sm px-[6px] py-1 hover:bg-red-100 hover:border-[#dc2626] hover:-translate-y-[1px] hover:shadow hover:shadow-red-200/50 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <div className='flex flex-nowrap flex-1 gap-4 mt-1 w-full'>
            <Button
              type='button'
              disabled={selectedFiles.length === 0 || loading}
              onClick={handleUpload}
              className='flex-1 text-white bg-[#3353F8] px-3 py-2 w-fit rounded-lg transition-all duration-200 ease-in flex gap-1 font-medium items-center cursor-pointer text-center hover:-translate-y-[1px] hover:bg-[#0049d4] hover:shadow hover:shadow-blue-800'
            >
              {loading ? (
                <>
                  <Loader className='w-4 h-4 animate-spin' /> Uploading...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UploadDocumentModal
