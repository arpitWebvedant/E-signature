import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Loader } from 'lucide-react'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  isLoading?: boolean
  documentTitle?: string
}

const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Document',
  description = 'Are you sure you want to delete this document? This action cannot be undone.',
  isLoading = false,
  documentTitle,
}: DeleteDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Delete error:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='gap-2.5 sm:max-w-md'>
        <DialogHeader className='space-y-1'>
          <div className='flex justify-center items-center mb-2.5 w-14 h-14 bg-red-50 rounded-full'>
            <div className='flex justify-center items-center w-10 h-10 bg-red-100 rounded-full'>
              {isLoading ? (
                <Loader className='w-6 h-6 text-red-600 animate-spin' />
              ) : (
                <Trash2 className='w-6 h-6 text-red-600' />
              )}
            </div>
          </div>
          <DialogTitle className='text-lg font-semibold'>{title}</DialogTitle>
          <DialogDescription className='text-base'>
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Document Preview */}
        {documentTitle && (
          <div className='flex items-center px-3 py-2 bg-[#E6351D]/5 border border-[#E6351D]/10 rounded-lg'>
            <div className='overflow-hidden'>
              <p className='text-sm capitalize font-semibold text-[#992008] truncate'>
                {documentTitle}
              </p>
              <p className='text-xs text-[#992008]'>
                Document • Will be permanently deleted
              </p>
            </div>
          </div>
        )}

        {/* Warning Section */}
        {/* <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">This action cannot be undone</p>
              <p className="mt-0.5 text-sm text-amber-700">
                All document data, signatures, and audit trails will be permanently removed from our servers.
              </p>
            </div>
          </div>
        </div> */}

        {/* Impact Details */}
        <div className='space-y-1 text-sm text-gray-600'>
          <h4 className='text-base font-semibold text-gray-900'>
            Noted Points
          </h4>
          <div className='flex items-center'>
            <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
            <span>All signatures will be lost</span>
          </div>
          <div className='flex items-center'>
            <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
            <span>Audit trail will be deleted</span>
          </div>
          <div className='flex items-center'>
            <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
            <span>Recipients will lose access</span>
          </div>
        </div>

        <DialogFooter className='flex gap-0'>
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant='outline'
            className='w-full'
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant='destructive'
            className='relative w-full text-white bg-red-600'
          >
            {isLoading ? (
              <>
                <Loader className='mr-2 w-4 h-4 animate-spin' />
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteDialog
