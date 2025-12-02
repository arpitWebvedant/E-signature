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
import { useParams } from 'next/navigation'
import { usePDFContext } from '@/context/PDFContext'
import { ChevronLeft, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import UploadDocumentModal from '@/components/documents/UploadDocumentsModal'

const Dashboard = () => {
  const { id: parentId } = useParams()
  const [folderName, setFolderName] = useState('')

  const { user } = useGlobalContext()
  const [folders, setFolders] = useState([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [isMovingFolder, setIsMovingFolder] = useState(false)
  const [isSettingsFolderOpen, setIsSettingsFolderOpen] = useState(false)
  const [isDeletingFolder, setIsDeletingFolder] = useState(false)
  const [folderToMove, setFolderToMove] = useState(null)
  const [folderToSettings, setFolderToSettings] = useState(null)
  const [folderToDelete, setFolderToDelete] = useState(null)
    const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false)
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id
  const { pagination, setPagination } = usePDFContext()
  const [checkUpdate, setCheckUpdate] = useState(false)
  useEffect(() => {
    if (!parentId) return
    fetchFolders()
  }, [parentId])

  const fetchFolders = async () => {
    setFoldersLoading(true)
    const response = await listFolders({ userId, parentId })
    const breadcrumbs = response.data[0]?.breadcrumbs

    const folderName = breadcrumbs.find(
      (item: any) => item.id === parentId * 1,
    )?.name
    setFolderName(folderName)
    // setPagination({
    //   ...pagination,
    //   statusCounts: {
    //     ...pagination.statusCounts,
    //     folderCount: response.data.length,
    //   },
    // })
    setFolders(response.data)
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
  console.log('folders', pagination)
  return (
    <div className='rounded-lg bg-white border border-[#EAECF0] relative flex flex-col'>
      <div className=' p-4 flex flex-col gap-2 border-b border-[#EAECF0] items-center sm:flex-row sm:justify-between'>
        <Link href='/folders' className='flex gap-2 items-center'>
          <ChevronLeft className='w-6 h-6' />
          <div>
            <p className='text-lg text-[#101828] font-semibold font-inter'>
              {folderName}
            </p>
            <p className='-mt-1 text-sm font-inter text-primary'>
              <div className='flex mt-1 space-x-2 text-xs truncate text-muted-foreground'>
                <span>{pagination?.statusCounts?.folderCount} sub folder</span>
              </div>
            </p>
          </div>
        </Link>
        <div className='flex gap-2 justify-between items-center lg:w-lg'>
          <div className='relative flex-1'>
            <Input
              type='search'
              placeholder='Search'
              className='bg-white focus-visible:ring-[#3353F8] !shadow-[0px 1px 2px 0px #1018280D] border !border-[#EAECF0] rounded-lg pl-8 placeholder:text-[#787878] text-base'
            />
            <Search
              className='absolute text-[#787878] left-3 top-1/2 -translate-y-1/2'
              size={18}
            />
          </div>
          <button onClick={() => setShowCreateFolderModal(true)} className='text-white bg-[#3353F8] px-3 py-2 w-fit rounded-lg transition-all duration-200 ease-in flex gap-1 font-medium items-center cursor-pointer text-center hover:-translate-y-[1px] hover:bg-[#0049d4] hover:shadow hover:shadow-blue-800'>
            <Plus className='text-[16px]' />
            Add New Folder
          </button>
            <button
                          onClick={() => setShowUploadDocumentModal(true)}
                          className='text-white bg-[#3353F8] px-3 py-2 w-fit rounded-lg transition-all duration-200 ease-in flex gap-1 font-medium items-center cursor-pointer text-center hover:-translate-y-[1px] hover:bg-[#0049d4] hover:shadow hover:shadow-blue-800'
                        >
                          <Plus className='text-[16px]' />
                          Add New documents
                        </button>
        </div>
      </div>
      <div className='flex flex-col p-4'>
        <div>
          <p className='text-xs font-medium text-[#667085] mb-2'>Sub Folders</p>
          <div className='grid grid-cols-1 gap-3 pt-1'>
            {folders.length === 0 ? (
              <FolderCardEmpty type='DOCUMENT' callback={() => fetchFolders()} />
            ) : (
              folders.map((folder: any) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onMove={(folderItem) => {
                    setFolderToMove(folderItem)
                    setIsMovingFolder(true)
                  }}
                  onPin={(folderId) => handlePinFolder(folderId)}
                  onUnpin={(folderId) => handleUnpinFolder(folderId)}
                  onSettings={(folderItem) => {
                    setFolderToSettings(folderItem)
                    setIsSettingsFolderOpen(true)
                  }}
                  onDelete={(folderItem) => {
                    handleDeleteFolder(folderItem?.id)
                  }}
                />
              ))
            )}
          </div>
        </div>

        <div className='mt-4'>
          <p className='text-xs font-medium text-[#667085] mb-2'>Document</p>
          <DocumentsList
          isFolderView={true}
            checkUpdate={checkUpdate}
            setCheckUpdate={setCheckUpdate}
            isHideFilter={true}
          />
        </div>
      </div>

      <CreateFolderDialog
        showModal={showCreateFolderModal}
        parentId={parentId}
        setShowModal={setShowCreateFolderModal}
        callback={() => fetchFolders()}
      />
       <UploadDocumentModal
        showModal={showUploadDocumentModal}
        setShowModal={setShowUploadDocumentModal}
      />
    </div>
  )
}

export default Dashboard
