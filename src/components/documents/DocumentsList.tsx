'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus,ChevronLeft,Search } from 'lucide-react'
import { usePDFContext } from '@/context/PDFContext'
import { DocumentsTable } from './DocumentsTable'
import DocumentsFilter from './DocumentsFilter'
import DocumentTablePagination from './DocumentTablePagination'
import UploadDocumentModal from './UploadDocumentsModal'
import axiosInstance, { getApiBaseUrl } from '@/config/apiConfig'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
interface Recipient {
  id: string
  name: string
  email: string
}

interface DocumentItem extends Document {
  id: string
  createdAt: string
  title: string
  sender: string
  recipient: Recipient[]
  status: 'pending' | 'completed' | 'draft' | 'rejected'
  pdfType: string
  size: string
  pages: string
}

const DocumentsList = ({
  checkUpdate,
  setCheckUpdate,
  isHideFilter,
  isFolderView,
}: {
  checkUpdate: boolean
  setCheckUpdate: (value: boolean) => void
  isHideFilter: boolean
  isFolderView: boolean
}) => {
  const { resetSteps, pagination, setPagination, setDocumentsLoading } = usePDFContext()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'ALL'
  const period = searchParams.get('period') || 'all'
  const query = searchParams.get('q') || ''
  const { id: folderId } = useParams()
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false)

  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState([] as DocumentItem[])
  
  // Track the current request to prevent race conditions
  const requestIdRef = useRef(0)

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    resetSteps()
    setPagination((prev) => ({
      ...pagination,
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    }))
  }, [resetSteps, setPagination])

  const fetchDocuments = useCallback(async () => {
    // Increment request ID and store current request ID
    requestIdRef.current += 1
    const currentRequestId = requestIdRef.current
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      setLoading(true)
      setDocumentsLoading(true)
      
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id

      const params = new URLSearchParams({
        userId: currentUserId?.toString() || '1',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      // ✅ Only append if folderId is defined
      if (folderId !== undefined && folderId !== null) {
        params.append('folderId', folderId.toString())
      }
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (period !== 'all') params.append('period', period)
      if (query) params.append('q', query)

      const response = await axiosInstance.get(
        `/api/v1/files/get-all-documents?${params.toString()}`,
        { signal: controller.signal }
      )
      
      // Ignore response if a newer request has been made
      if (currentRequestId !== requestIdRef.current) {
        return
      }
      
      const data = await response.data
      // @TODO
      const documents = data.data.map((doc: any) => ({
        id: doc?.id,
        createdAt: doc?.createdAt || '',
        title: doc?.title || '',
        sender: doc?.user?.email || '',
        recipient: doc?.recipientDetails || [],
        user: doc?.user || {},
        folder: doc?.folder || {},
        status: doc?.status || '',
        pdfType: doc?.documentData?.fileType || 'pdf',
        size: doc?.size || '',
        pages: doc?.documentData?.pageCount || '',
        pageCount: doc?.documentData?.pageCount || 0,
        documentSignData: doc?.documentSignData || null,
      }))

      setDocuments(documents)
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        totalItems: data.pagination.totalItems,
        totalPages: data.pagination.totalPages,
        statusCounts: data.pagination.statusCounts,
      })
    } catch (error) {
      if (axios.isCancel(error)) {
        return
      }
      console.error('Error fetching documents:', error)
      // Only clear loading if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        setDocuments([])
      }
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
        setDocumentsLoading(false)
      }
    }
  }, [pagination.page, pagination.limit, statusFilter, period, query, folderId, setDocumentsLoading, setPagination])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])
 
  return (
    <>
      <div className={isFolderView ? '' : 'rounded-lg bg-white border border-[#EAECF0] relative flex flex-col h-full'}>
        {/* Header */}
          {!isHideFilter && (
        <div className='p-4 border-b border-[#EAECF0]'>
            <div className='flex flex-col gap-2 items-center sm:flex-row sm:justify-between'>
              <div className='text-center sm:text-left'>
                <div className='flex gap-2 justify-center items-center sm:justify-start'>
                  <p className='text-lg text-[#101828] font-semibold font-inter'>
                    Documents List
                  </p>
                  <div className='bg-[#3353F81A] w-fit font-medium font-inter text-xs text-[#3353F8] py-1 px-2 rounded-2xl'>
                    <span className='mr-1'>{pagination.totalItems}</span>
                    Documents
                  </div>
                </div>
                <p className='font-inter text-sm text-[#667085] mt-1'>
                  Keep track of documents and their security ratings.
                </p>
              </div>
              <button
                onClick={() => setShowUploadDocumentModal(true)}
                className='text-white bg-[#3353F8] px-3 py-2 w-fit rounded-lg transition-all duration-200 ease-in flex gap-1 font-medium items-center cursor-pointer text-center hover:-translate-y-[1px] hover:bg-[#0049d4] hover:shadow hover:shadow-blue-800'
              >
                <Plus className='text-[16px]' />
                Add New documents
              </button>
            </div>
        </div>
          )}

        {/* Table Filter */}
        {!isHideFilter && <DocumentsFilter documents={documents} />}
        <DocumentsTable
          documents={documents}
          loading={loading}
          isFolderView={isFolderView}
          setDocuments={setDocuments}
          isHideFilter={isHideFilter}
        />
        <div className='border-t border-[#EAECF0] p-4 flex justify-between items-center'>
          <DocumentTablePagination
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            onNext={() => {
              setPagination({ ...pagination, page: pagination.page + 1 })
            }}
            onPrevious={() => {
              setPagination({ ...pagination, page: pagination.page - 1 })
            }}
            loading={loading}
          />
        </div>
      </div>
      <UploadDocumentModal
        showModal={showUploadDocumentModal}
        setShowModal={setShowUploadDocumentModal}
      />
    </>
  )
}

export default DocumentsList
