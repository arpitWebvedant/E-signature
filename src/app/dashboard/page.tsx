'use client'

import { Plus } from 'lucide-react'
import DocumentsList from '@/components/documents/DocumentsList'
import RecentActivity from '@/components/documents/RecentActivity'
import DocumentsStats from '@/components/documents/DocumentsStats'
import { useGlobalContext } from '@/context/GlobalContext'
import CreateFolderDialog from '@/components/common/CreateFolderDialog'
import { useState, useEffect } from 'react'
import {
  listFolders,
  pinFolder,
  unpinFolder,
  moveFolder,
  deleteFolder,
} from '@/services/api-set-up/handleApi'
import { FolderCardEmpty, FolderCard } from '@/components/folder/folder-card'
import { usePDFContext } from '@/context/PDFContext'


const Dashboard = () => {
  const { user } = useGlobalContext()
  const { pagination, setPagination, documentsLoading } = usePDFContext()
  const [folders, setFolders] = useState([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [documents, setDocuments] = useState([] as DocumentItem[])
  const [isMovingFolder, setIsMovingFolder] = useState(false)
  const [isSettingsFolderOpen, setIsSettingsFolderOpen] = useState(false)
  const [isDeletingFolder, setIsDeletingFolder] = useState(false)
  const [folderToMove, setFolderToMove] = useState(null)
  const [folderToSettings, setFolderToSettings] = useState(null)
  const [folderToDelete, setFolderToDelete] = useState(null)
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id
  useEffect(() => {
    if (userId) {
      fetchFolders()
    }
  }, [userId])
  const fetchFolders = async () => {
    setFoldersLoading(true)
    const response = await listFolders({ userId })
    // setPagination({
    //   ...pagination,
    //   statusCounts: {
    //     ...pagination.statusCounts,
    //     folderCount: response?.data?.length
    //   }
    // })
    setFolders(response?.data)
    setFoldersLoading(false)
  }
  const handleMoveFolder = async (folderId: number) => {
    const response = await moveFolder({ folderId })
    fetchFolders()
  }
  const handleDeleteFolder = async (folderId: number) => {
    const response = await deleteFolder({ userId: userId, folderId: folderId })
    fetchFolders()
  }
  const handlePinFolder = async (folderId: string) => {
    const response = await pinFolder({ folderId })
    fetchFolders()
  }
  const handleUnpinFolder = async (folderId: string) => {
    const response = await unpinFolder({ folderId })
    fetchFolders()
  }
  return (
    <div className='flex flex-col gap-4'>
      <div className='border border-solid border-[#EAECF0] bg-white p-4 rounded-2xl flex justify-between items-center'>
        <div>
          <p className='text-xl font-semibold text-gray-900'>
            👋 Welcome Back, {user?.name}
          </p>
          <p className='mt-1 text-sm text-gray-500'>
            Secure, fast, and legally binding electronic signatures made simple
          </p>
        </div>
        <button
          onClick={() => setShowCreateFolderModal(true)}
          className='text-white bg-[#3353F8] px-3 py-2 w-fit rounded-lg transition-all duration-200 ease-in-out flex gap-1 font-medium items-center cursor-pointer text-center hover:-translate-y-[1px] hover:bg-[#0049d4] hover:shadow-[0 4px 8px rgba(51, 83, 248, 0.3)]'
        >
          <Plus className='text-[16px]' />
          Create New Folder
        </button>
      </div>
      <div className='border border-solid border-[#EAECF0] bg-white p-4 rounded-2xl flex justify-between items-center'>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
          {foldersLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className='border border-[#EAECF0] rounded-lg p-3 animate-pulse'>
                <div className='flex gap-3 items-center'>
                  <div className='w-8 h-8 bg-gray-200 rounded-lg'></div>
                  <div className='flex-1'>
                    <div className='h-4 w-40 bg-gray-200 rounded mb-2'></div>
                    <div className='h-3 w-32 bg-gray-200 rounded'></div>
                  </div>
                  <div className='w-8 h-8 bg-gray-200 rounded'></div>
                </div>
              </div>
            ))
          ) : (!folders || folders?.length === 0) ? (
            <FolderCardEmpty type='DOCUMENT' callback={() => fetchFolders()} />
          ) : (
            folders?.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onMove={(folder) => {
                  setFolderToMove(folder)
                  setIsMovingFolder(true)
                }}
                onPin={(folderId) => handlePinFolder(folderId)}
                onUnpin={(folderId) => handleUnpinFolder(folderId)}
                onSettings={(folder) => {
                  setFolderToSettings(folder)
                  setIsSettingsFolderOpen(true)
                }}
                onDelete={(folder) => {
                  handleDeleteFolder(folder?.id)
                }}
              />
            ))
          )}
        </div>
      </div>
      <DocumentsStats loading={foldersLoading || documentsLoading} />
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-5'>
        <div className='xl:col-span-4'>
          <DocumentsList />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
      <CreateFolderDialog
        showModal={showCreateFolderModal}
        setShowModal={setShowCreateFolderModal}
        callback={() => {
          fetchFolders()
        }}
      />
    </div>
  )
}

export default Dashboard
