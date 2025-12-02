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
import { FileSignature } from 'lucide-react'

interface EnableSigningOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  documentTitle?: string
  firstSignerEmail?: string
}

const EnableSigningOrderDialog = ({
  isOpen,
  onClose,
  onConfirm,
  documentTitle = 'this document',
  firstSignerEmail = '',
}: EnableSigningOrderDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center space-y-2 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full">
            <FileSignature className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle>Enable Signing Order</DialogTitle>
          <DialogDescription>
            Configure the signing order for {documentTitle}. The first signer will be notified to sign the document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* First Signer Info */}
          {firstSignerEmail && (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <FileSignature className="mr-3 w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">First Signer:</p>
                <p className="text-sm text-blue-600">{firstSignerEmail}</p>
              </div>
            </div>
          )}

          {/* Document Info */}
          <div className="p-3 text-sm bg-gray-50 rounded-lg">
            <p>
              <span className="font-medium">Document:</span> {documentTitle}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Enabling signing order will require signers to complete the document in the specified sequence.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="w-full"
          >
            Enable Signing Order
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EnableSigningOrderDialog