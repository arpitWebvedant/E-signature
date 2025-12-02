'use client'
import { Plus, Search, FolderClosed } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { deleteFolder, listFolders, pinFolder, unpinFolder } from '@/services/api-set-up/handleApi'
import { FolderCard, FolderCardEmpty } from '@/components/folder/folder-card'
import CreateFolderDialog from '@/components/common/CreateFolderDialog'
import { usePDFContext } from '@/context/PDFContext'

const FoldersPage = () => {
  const { pagination, setPagination } = usePDFContext()
    const [isMovingFolder, setIsMovingFolder] = useState(false)
    const [isSettingsFolderOpen, setIsSettingsFolderOpen] = useState(false)
    const [isDeletingFolder, setIsDeletingFolder] = useState(false)
    const [folderToMove, setFolderToMove] = useState(null)
    const [folderToSettings, setFolderToSettings] = useState(null)
    const [folderToDelete, setFolderToDelete] = useState(null)
    const [folders, setFolders] = useState([])
    const [foldersLoading, setFoldersLoading] = useState(false)
    const [deletingFolderIds, setDeletingFolderIds] = useState<(string | number)[]>([])
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id
    useEffect(() => {
      if(userId){
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
      //     folderCount: response.data.length
      //   }
      // })
      setFolders(response.data)
      setFoldersLoading(false)
    }
  const handleDeleteFolder = async (folder: any) => {
    const folderId = folder?.id
    if (!folderId) return

    setDeletingFolderIds((prev) => [...prev, folderId])

    const prevFolders = folders
    setFolders((current) => current.filter((f: any) => f.id !== folderId))

    try {
      await deleteFolder({ userId: userId, folderId })
      // Optionally, update pagination count locally instead of full reload
      // setPagination({
      //   ...pagination,
      //   statusCounts: {
      //     ...pagination.statusCounts,
      //     folderCount: (pagination.statusCounts.folderCount || 0) - 1,
      //   },
      // })
    } catch (error) {
      console.error('Failed to delete folder', error)
      // Restore previous list if API fails
      setFolders(prevFolders)
    } finally {
      setDeletingFolderIds((prev) => prev.filter((id) => id !== folderId))
    }
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
    <div className="rounded-lg bg-white border border-[#EAECF0] relative">
      <div className="p-4 border-b">
        <div className="flex flex-col gap-2 items-center lg:flex-row lg:justify-between">
          <div>
            <div className="flex gap-2 items-center text-center">
              <p className="text-lg text-[#101828] font-semibold font-inter">Folders</p>
              <div className="bg-[#3353F81A] w-fit font-medium font-inter text-xs text-[#3353F8] py-1 px-2 rounded-2xl">
                <span className="mr-1">24</span>
                Folder
              </div>
            </div>
            <p className="font-inter text-sm text-[#667085] mt-0.5">Keep track of documents and their security ratings.</p>
          </div>
          <div className="flex gap-2 justify-between items-center lg:w-1/2">
            <div className="relative flex-1">
              <Input
                type='search'
                placeholder='Search'
                className="bg-white focus-visible:ring-[#3353F8] !shadow-[0px 1px 2px 0px #1018280D] border !border-[#EAECF0] rounded-lg pl-8 placeholder:text-[#787878] text-base"
              />
              <Search className="absolute text-[#787878] left-3 top-1/2 -translate-y-1/2" size={18} />
            </div>
     
            <button onClick={() => setShowCreateFolderModal(true)} className='text-white bg-[#3353F8] px-3 py-2 w-fit rounded-lg transition-all duration-200 ease-in flex gap-1 font-medium items-center cursor-pointer text-center hover:-translate-y-[1px] hover:bg-[#0049d4] hover:shadow hover:shadow-blue-800'>
              <Plus className='text-[16px]' />
              Add New Folder
            </button>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-4 p-4'>
      <div className="grid grid-cols-1 gap-4">
        {foldersLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className='border border-[#EAECF0] rounded-lg p-3 animate-pulse'>
              <div className='flex gap-3 items-center'>
                <div className='w-8 h-8 bg-gray-200 rounded-lg'></div>
                <div className='flex-1'>
                  <div className='mb-2 w-40 h-4 bg-gray-200 rounded'></div>
                  <div className='w-32 h-3 bg-gray-200 rounded'></div>
                </div>
                <div className='w-8 h-8 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))
        ) : folders.length === 0 ? (
          <FolderCardEmpty type='DOCUMENT' callback={() => fetchFolders()} />
        ) : (
          folders.map((folder: any) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              isDeleting={deletingFolderIds.includes(folder.id)}
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
              handleDeleteFolder(folderItem)
              // setFolderToDelete(folderItem)
              // setIsDeletingFolder(true)
            }}
          />
          )))}
      
      </div>

      </div>
      <CreateFolderDialog
        showModal={showCreateFolderModal}
        setShowModal={setShowCreateFolderModal}
        callback={() => fetchFolders()}
      />
    </div>
  )
}

export default FoldersPage
