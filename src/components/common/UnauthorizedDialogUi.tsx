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
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Loader,
  TriangleAlert,
} from 'lucide-react'

interface UnauthorizedDialogUiProps {
  isOpen: boolean
  onClose: () => void
  reason:
    | 'already_rejected'
    | 'already_signed'
    | 'token_invalid'
    | 'access_denied'
  isLoading?: boolean
  rejectData?: any
  isPublicUrl?: boolean
}

const UnauthorizedDialogUi = ({
  isOpen,
  onClose,
  reason,
  isLoading = false,
  rejectData,
  isPublicUrl = false,
}: UnauthorizedDialogUiProps) => {
  // Configuration for different reason types
  const reasonConfig = {
    already_rejected: {
      title: 'Document Already Rejected',
      description:
        'This document has already been rejected by you. You cannot reject it again.',
      icon: <TriangleAlert className='w-6 h-6 text-amber-600' />,
      iconBg: 'bg-orange-100',
      titleColor: 'text-gray-900',
      descriptionColor: 'text-gray-600',
    },
    already_signed: {
      title: 'Document Already Signed',
      description:
        'This document has already been signed by you. You cannot reject a signed document.',
      icon: <CheckCircle className='w-6 h-6 text-green-600' />,
      iconBg: 'bg-green-100',
      titleColor: 'text-gray-900',
      descriptionColor: 'text-gray-600',
      buttonText: 'Back to Dashboard',
    },
    token_invalid: {
      title: 'Invalid Link',
      description:
        'This rejection link is invalid or has expired. Please request a new link if needed.',
      icon: <XCircle className='w-6 h-6 text-red-600' />,
      iconBg: 'bg-red-100',
      titleColor: 'text-red-900',
      descriptionColor: 'text-red-700',
      buttonText: 'Back to Dashboard',
    },
    access_denied: {
      title: 'Access Denied',
      description:
        'You do not have permission to reject this document. Please contact the document owner.',
      icon: <Shield className='w-6 h-6 text-red-600' />,
      iconBg: 'bg-red-100',
      titleColor: 'text-red-900',
      descriptionColor: 'text-red-700',
      buttonText: 'Back to Dashboard',
    },
  }

  const config = reasonConfig[reason]

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isPublicUrl && !open) return
        onClose()
      }}
    >
      <DialogContent
        className='gap-2.5 sm:max-w-md'
        onPointerDownOutside={(e) => {
          if (isPublicUrl) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isPublicUrl) e.preventDefault()
        }}
      >
        <DialogHeader className='space-y-1'>
          {/* Icon Section */}
          <div
            className={`flex justify-center items-center mb-2.5 w-14 h-14  ${config.iconBg.replace(
              '100',
              '50',
            )} rounded-full`}
          >
            <div
              className={`flex justify-center items-center w-10 h-10 ${config.iconBg} rounded-full`}
            >
              {isLoading ? (
                <Loader className='w-6 h-6 animate-spin' />
              ) : (
                config.icon
              )}
            </div>
          </div>

          {/* Title */}
          <DialogTitle className={`text-lg font-semibold ${config.titleColor}`}>
            {config.title}
          </DialogTitle>

          {/* Description */}
          <DialogDescription className={`text-base ${config.descriptionColor}`}>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Additional Information Section */}

        <div className='flex items-start'>
          <div>
            <div className='mt-1 space-y-1 text-sm text-gray-700'>
              {reason === 'already_rejected' && (
                <>
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-gray-800'>
                      Subject
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <span className='text-sm text-gray-600'>
                      {rejectData?.category === 'WRONG_RECIPIENT'
                        ? 'Wrong recipient'
                        : rejectData?.category === 'WRONG_VERSION'
                        ? 'Wrong version'
                        : rejectData?.category === 'MISSING_INFO'
                        ? 'Missing information'
                        : rejectData?.category === 'OTHER'
                        ? 'Other'
                        : 'Other'}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-gray-800'>
                      Reason of Rejection
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <span className='text-sm text-gray-600'>
                      {rejectData?.reason}
                    </span>
                  </div>
                </>
              )}
              {reason === 'already_signed' && (
                <>
                  <div className='flex items-center'>
                    <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
                    <span>View the signed document in your dashboard</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
                    <span>Download a copy for your records</span>
                  </div>
                </>
              )}
              {reason === 'token_invalid' && (
                <>
                  <div className='flex items-center'>
                    <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
                    <span>Request a new rejection link from the sender</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
                    <span>Check if the link has expired</span>
                  </div>
                </>
              )}
              {reason === 'access_denied' && (
                <>
                  <div className='flex items-center'>
                    <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
                    <span>
                      Verify your email address with the document owner
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
                    <span>Request proper access permissions</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {reason !== 'already_rejected' && (
          <div className='space-y-1 text-sm text-gray-600'>
            <h4 className='text-base font-semibold text-gray-900'>
              Current Status
            </h4>
            <div className='flex items-center'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>
                {reason === 'already_rejected' && 'Document status: Rejected'}
                {reason === 'already_signed' && 'Document status: Signed'}
                {reason === 'token_invalid' && 'Link status: Invalid/Expired'}
                {reason === 'access_denied' && 'Permission status: Denied'}
              </span>
            </div>
            <div className='flex items-center'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>Action required: None</span>
            </div>
            <div className='flex items-center'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>Next steps: Return to dashboard</span>
            </div>
          </div>
        )}
        {config.buttonText && (
          <DialogFooter className='flex justify-center pt-2'>
            <Button
              onClick={onClose}
              variant='outline'
              disabled={isLoading}
              className={`w-full border-2`}
            >
              {isLoading ? (
                <>
                  <Loader className='mr-2 w-4 h-4 animate-spin' />
                  Processing...
                </>
              ) : (
                config.buttonText
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UnauthorizedDialogUi
