import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Lock, Mail } from 'lucide-react'

interface UnauthorizedDialogProps {
  isOpen: boolean
  onClose: () => void
  documentTitle?: string
  currentUserEmail?: string
  documentOwner?: string
}

const UnauthorizedDialog = ({ 
  isOpen, 
  onClose, 
  documentTitle = "this document",
  currentUserEmail = "",
  documentOwner = ""
}: UnauthorizedDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Access Denied</DialogTitle>
          <DialogDescription className="text-center">
            You are not authorized to access this document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current User Info */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Mail className="mr-3 w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium">Logged in as:</p>
              <p className="text-sm text-gray-600">{currentUserEmail || "Unknown user"}</p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex items-start p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 mr-3 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Document Not Assigned</p>
              <p className="text-sm text-amber-700">
                This document is not assigned to your email address. Please contact the document owner for access.
              </p>
            </div>
          </div>

          {/* Document Info */}
          {documentOwner && (
            <div className="p-3 text-sm bg-blue-50 rounded-lg">
              <p>
                <span className="font-medium">Document owner:</span> {documentOwner}
              </p>
              {documentTitle && documentTitle !== "this document" && (
                <p className="mt-1">
                  <span className="font-medium">Document:</span> {documentTitle}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button onClick={onClose} className="w-full">
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UnauthorizedDialog