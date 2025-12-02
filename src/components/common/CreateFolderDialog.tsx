'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useParams, useRouter } from 'next/navigation'
import { createFolder } from '@/services/api-set-up/handleApi'
import { Loader } from 'lucide-react'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface CreateFolderDialogProps {
  showModal: boolean
  setShowModal: (value: boolean) => void
  teamId?: number | null
  visibility?: string
  callback?: () => void
}

const CreateFolderDialog = ({
  showModal,
  setShowModal,
  teamId = null,
  visibility = 'EVERYONE',
  callback,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { id: parentId } = useParams()

  const handleCreate = async () => {
    if (!folderName.trim()) return
    const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id
    setLoading(true)
    try {
      await createFolder({
        name: folderName.trim(),
        userId,
        teamId,
        parentId: parentId && parentId * 1,
        visibility,
      })

      setShowModal(false)
      setFolderName('')
      if (callback) {
        callback()
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='bg-white rounded-xl shadow-lg'>
        <DialogTitle>
          <p className='text-lg font-semibold text-[#181D27] leading-tight'>
            Create New Folder
          </p>
          <p className='text-[#535862] text-sm font-normal mt-0.5'>
            Add a folder to organize your documents
          </p>
        </DialogTitle>

        <div className='mt-3'>
          <Label className=''>Folder Name</Label>
          <Input
            type='text'
            placeholder='Enter folder name'
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className='w-full border border-[#E3ECFF] rounded-lg mt-1 p-2'
          />
        </div>
        <DialogFooter>
          <div className='flex flex-1 gap-3 mt-3 w-full'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowModal(false)}
              className='flex-1 px-3 py-2 rounded-lg border'
            >
              Cancel
            </Button>
            <Button
              type='button'
              disabled={!folderName || loading}
              onClick={handleCreate}
              className='flex-1 text-white bg-[#3353F8] px-3 py-2 rounded-lg flex gap-2 items-center justify-center hover:bg-[#0049d4]'
            >
              {loading ? (
                <>
                  <Loader className='w-4 h-4 animate-spin' /> Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateFolderDialog
