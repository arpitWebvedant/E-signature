import { Button } from '@/components/ui/button'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { usePDFContext } from '@/context/PDFContext'
import axiosInstance from '@/config/apiConfig'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  Download,
  Edit,
  EyeIcon,
  SignatureIcon,
  Trash,
} from 'lucide-react'
import axios from 'axios'
import { useState } from 'react'
import { downloadPDF } from '../lib/client-only/download-pdf'
import DeleteDialog from '@/components/common/DeleteDialog'
import SuccessDeleteDialog from '@/components/common/SuccessDeleteDialog'
import { DocumentData } from '../schema/types'

export type Recipient = {
  email: string
  role: 'SIGNER' | 'APPROVER' | 'CC'
  signingStatus: 'SIGNED' | 'PENDING'
  token: string
}

export type User = {
  id: number
  email: string
}

export type DocumentRow = {
  id: number
  title: string
  status: 'DRAFT' | 'PENDING' | 'COMPLETED'
  user: User
  team?: { id: number; url: string }
  recipient: Recipient[]
  documentData?: DocumentData
}

type DocumentsTableActionButtonProps = {
  row: DocumentRow
  setDocuments: (documents: DocumentItem[]) => void
  documents: any
  isFolderView?: boolean
}

export const DocumentsTableActionButton = ({
  row,
  setDocuments,
  isFolderView = false,
}: DocumentsTableActionButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const router = useRouter()
  const { setDocId, setPagination } = usePDFContext()
  const currentUser = JSON.parse(localStorage.getItem('user') ?? '{}')
  const userId = currentUser?.id
  // Recipient & ownership checks
  const recipient = row?.recipient?.find((r) => r.email === currentUser?.email)
  const isOwner = row?.user?.id === userId
  const isRecipient = !!recipient
  const isDraft = row?.status === 'DRAFT'
  const isPending = row?.status === 'PENDING'
  const isComplete = row?.status === 'COMPLETED'
  const isSigned = recipient?.signingStatus === 'SIGNED'
  const showIsDownload = row?.recipient?.some(
    (r) => r.signingStatus === 'SIGNED',
  )
  const idEditRemove =
    row?.recipient?.every((r) => r.signingStatus === 'NOT_SIGNED') || false

  const role = recipient?.signingStatus

  /** ---- API Calls ---- */
  const fetchDocument = async (documentId: string, folderId: string) => {
    if (!documentId || !userId) return null
    const { data } = await axiosInstance.get(
      `/api/v1/files/get-document`,
      {
        params: { documentId, userId, folderId },
      },
    )
    return data
  }

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams({
        userId: userId?.toString() || '1',
        page: '1',
        limit: '10',
      })
      const res = await axiosInstance.get(
        `/api/v1/files/get-all-documents?${params.toString()}`,
      )
      const data = await res.data

      const mapped = data.data.map((doc: any) => ({
        id: doc?.id,
        createdAt: doc?.createdAt || '',
        title: doc?.title || '',
        sender: doc?.user?.email || '',
        recipient: doc?.recipientDetails || [],
        user: doc?.user || {},
        status: doc?.status || '',
        pdfType: doc?.pdfType || 'pdf',
        size: doc?.size || '',
        pages: doc?.pages || '',
        pageCount: doc?.documentData?.pageCount || 0,
      }))

      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        totalItems: data.pagination.totalItems,
        totalPages: data.pagination.totalPages,
        statusCounts: data.pagination.statusCounts,
      })
      setDocuments(mapped)
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await axiosInstance.delete(`/api/v1/files/delete-document`, {
        params: { documentId: row.id, userId },
      })
      setModalOpen(false)
      setSuccessOpen(true)
      fetchDocuments()
    } catch (err) {
      console.error('Error deleting document:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async (data: any, email: string) => {
    const documentDataToDownload =
      data?.data?.documentData || data?.documentData || data

    if (!documentDataToDownload) {
      alert('No document data available for download')
      return
    }

    await downloadPDF({
      documentData: documentDataToDownload,
      documentId: row.id,
      // fileName: row.title || `document-${row.id}.pdf`,
      fileName:
        row?.documentSignData?.['0']?.data?.title?.trim() ||
        row.title ||
        `document-${row.id}.pdf`,
      userId,
      email,
    })
    setIsDownloading(false)
  }

  const onDownloadClick = async () => {
    try {
      setIsDownloading(true)
      const documentData = await fetchDocument(
        row.id.toString(),
        row.id.toString(),
      )
      const lastRecipient = row?.recipient?.[row?.recipient?.length - 1]
      const lastRecipientEmail =
        lastRecipient?.email ??
        row?.recipient?.[0]?.email ??
        currentUser?.email ??
        ''
      if (!lastRecipientEmail) {
        setIsDownloading(false)
        alert('No recipient email available for download')
        return
      }
      await handleDownload(documentData, lastRecipientEmail)
      // {
      //   row?.recipient?.map((items: any) => {
      //     setTimeout(() => {
      //       if (documentData) handleDownload(documentData ,items.email)
      //     }, 2000)
      //   })
      // }
    } catch (err) {
      console.error('Error downloading document:', err)
      setIsDownloading(false)
      alert('Error downloading document')
    }
  }

  /** ---- Navigation ---- */
  const clickRedirect = () => {
    setDocId(row.id)

    // 🟢 Set temporary state in sessionStorage
    sessionStorage.setItem(
      'navState',
      JSON.stringify({
        from: 'dashboard',
        docId: row.id,
        redirectToURL: window.location.pathname,
        timestamp: Date.now(),
      }),
    )

    if (isOwner && isDraft) return router.push(`/documents/${row.id}/edit`)

    if (isRecipient && isPending && !isSigned)
      return router.push(`/sign_document/${row.id}/sign`)

    if (isComplete || isSigned)
      return router.push(`/sign_document/${row.id}/sign`)

    if (isPending && isSigned)
      return router.push(`/sign_document/${row.id}/sign`)

    return router.push(`/documents/${row.id}/edit`)
  }

  /** ---- Shared UI ---- */
  const DeletePopups = (
    <>
      <DeleteDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isLoading={isDeleting}
        // documentTitle={row.title}
        documentTitle={
          row?.documentSignData?.['0']?.data?.title?.trim() || row.title
        }
        setModalOpen={setModalOpen}
        onConfirm={handleDelete}
        title='Delete Document'
        description='This will permanently delete the document and all associated data. This action cannot be undone.'
      />
      <SuccessDeleteDialog
        open={successOpen}
        setOpen={setSuccessOpen}
        onConfirm={() => fetchDocuments()}
      />
    </>
  )

  const TrashButton = isOwner && (
    <Button className='px-0 py-0 w-10' onClick={() => setModalOpen(true)}>
      <Trash className='w-4 h-4' />
    </Button>
  )

  /** ---- Conditional Buttons ---- */
  // Hide CC role until document is complete
  if (recipient?.role === 'CC' && !isComplete) return null

  if (isFolderView) {
    if (isRecipient && isPending && !isSigned) {
      return (
        <>
          {showIsDownload && (
            <>
              <DropdownMenuItem onClick={onDownloadClick}>
                <Download className='mr-2 w-4 h-4' />
                <div>Download</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/preview/${row.id}/document`)}
              >
                <EyeIcon className='mr-2 w-4 h-4' />
                <div>Preview</div>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={clickRedirect}>
            {role === 'SIGNER' ? (
              <CheckCircle className='mr-2 w-4 h-4' />
            ) : (
              <SignatureIcon className='mr-2 w-4 h-4' />
            )}
            <div>{role === 'SIGNER' ? 'Sign document' : 'Review document'}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setModalOpen(true)}>
            <Trash className='mr-2 w-4 h-4' />
            <div>Delete</div>
          </DropdownMenuItem>
          {DeletePopups}
        </>
      )
    }

    if (isComplete || isSigned) {
      return (
        <>
          <DropdownMenuItem onClick={onDownloadClick} disabled={isDownloading}>
            {isDownloading && isSigned ? (
              <div className='mr-2 w-4 h-4 rounded-full border-2 border-current animate-spin border-t-transparent' />
            ) : (
              <Download className='mr-2 w-4 h-4' />
            )}
            <div>Download</div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/preview/${row.id}/document`)}
          >
            <EyeIcon className='mr-2 w-4 h-4' />
            <div>Preview</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isOwner && (
            <DropdownMenuItem onClick={() => setModalOpen(true)}>
              <Trash className='mr-2 w-4 h-4' />
              <div>Delete</div>
            </DropdownMenuItem>
          )}
          {DeletePopups}
        </>
      )
    }

    if (isPending && isSigned) {
      return (
        <>
          <DropdownMenuItem disabled>
            <SignatureIcon className='mr-2 w-4 h-4' />
            <div>Waiting for others</div>
          </DropdownMenuItem>
          {showIsDownload && (
            <>
              <DropdownMenuItem onClick={onDownloadClick}>
                <Download className='mr-2 w-4 h-4' />
                <div>Download</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/preview/${row.id}/document`)}
              >
                <EyeIcon className='mr-2 w-4 h-4' />
                <div>Preview</div>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          {isOwner && (
            <DropdownMenuItem onClick={() => setModalOpen(true)}>
              <Trash className='mr-2 w-4 h-4' />
              <div>Delete</div>
            </DropdownMenuItem>
          )}
          {DeletePopups}
        </>
      )
    }

    if (isOwner && isDraft) {
      return (
        <>
          {idEditRemove && (
            <DropdownMenuItem onClick={clickRedirect}>
              <Edit className='mr-2 w-4 h-4' />
              <div>Edit</div>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setModalOpen(true)}>
            <Trash className='mr-2 w-4 h-4' />
            <div>Delete</div>
          </DropdownMenuItem>
          {DeletePopups}
        </>
      )
    }

    return (
      <>
        {idEditRemove && (
          <DropdownMenuItem onClick={clickRedirect}>
            <Edit className='mr-2 w-4 h-4' />
            <div>Edit</div>
          </DropdownMenuItem>
        )}
        {showIsDownload && (
          <>
            <DropdownMenuItem onClick={onDownloadClick}>
              <Download className='mr-2 w-4 h-4' />
              <div>Download</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/preview/${row.id}/document`)}
            >
              <EyeIcon className='mr-2 w-4 h-4' />
              <div>Preview</div>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        {isOwner && (
          <DropdownMenuItem onClick={() => setModalOpen(true)}>
            <Trash className='mr-2 w-4 h-4' />
            <div>Delete</div>
          </DropdownMenuItem>
        )}
        {DeletePopups}
      </>
    )
  }

  if (isRecipient && isPending && !isSigned) {
    return (
      <>
        {showIsDownload && (
          <>
            <Button className='px-0 py-0 w-10 cursor-pointer' onClick={onDownloadClick}>
              <Download className='w-4 h-4' />
            </Button>
            <Button
              className='px-0 py-0 w-10 cursor-pointer'
              onClick={() => router.push(`/preview/${row.id}/document`)}
            >
              <EyeIcon className='w-4 h-4' />
            </Button>
          </>
        )}
        {DeletePopups}
        <Button className='px-0 py-0 w-10 cursor-pointer' onClick={clickRedirect}>
          {role === 'SIGNER' ? (
            <CheckCircle className='w-4 h-4' />
          ) : (
            <SignatureIcon className='w-4 h-4' />
          )}
        </Button>
        {TrashButton}
      </>
    )
  }

  if (isComplete || isSigned) {
    return (
      <>
        <Button
          className={isDownloading && isSigned ? 'w-40 cursor-pointer ' : 'w-10 px-0 py-0 cursor-pointer'}
          onClick={onDownloadClick}
          disabled={isDownloading}
        >
          {isDownloading && isSigned ? (
            <div className='w-4 h-4 rounded-full border-2 border-current animate-spin border-t-transparent' />
          ) : (
            <Download className='w-4 h-4' />
          )}
        </Button>
        <Button
          className='px-0 py-0 w-10 cursor-pointer'
          onClick={() => router.push(`/preview/${row.id}/document`)}
        >
          <EyeIcon className='w-4 h-4' />
        </Button>
        {TrashButton}
        {DeletePopups}
      </>
    )
  }

  if (isPending && isSigned) {
    return (
      <>
        <Button className='px-0 py-0 w-10 cursor-pointer' disabled>
          <SignatureIcon className='w-4 h-4' />
        </Button>
        {showIsDownload && (
          <>
            <Button className='px-0 py-0 w-10 cursor-pointer' onClick={onDownloadClick}>
              <Download className='w-4 h-4' />
            </Button>
            <Button
              className='px-0 py-0 w-10 cursor-pointer'
              onClick={() => router.push(`/preview/${row.id}/document`)}
            >
              <EyeIcon className='w-4 h-4' />
            </Button>
          </>
        )}
        {TrashButton}
      </>
    )
  }

  if (isOwner && isDraft) {
    return (
      <>
        {idEditRemove && (
          <Button className='px-0 py-0 w-10 cursor-pointer' onClick={clickRedirect}>
            <Edit className='w-4 h-4' />
          </Button>
        )}
        {TrashButton}
        {DeletePopups}
      </>
    )
  }

  return (
    <>
      {idEditRemove && (
        <Button className='px-0 py-0 w-10 cursor-pointer' onClick={clickRedirect}>
          <Edit className='w-4 h-4' />
        </Button>
      )}
      {showIsDownload && (
        <>
          <Button className='px-0 py-0 w-10 cursor-pointer' onClick={onDownloadClick}>
            <Download className='w-4 h-4' />
          </Button>
          <Button
            className='px-0 py-0 w-10 cursor-pointer'
            onClick={() => router.push(`/preview/${row.id}/document`)}
          >
            <EyeIcon className='w-4 h-4' />
          </Button>
        </>
      )}
      {TrashButton}
      {DeletePopups}
    </>
  )
}
