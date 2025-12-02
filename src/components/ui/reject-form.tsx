import * as React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'
import { Button } from './button'
import { Textarea } from './textarea'
import { Label } from './label'
import { Input } from './input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Checkbox } from './checkbox'
import { cn } from '../lib/ClsxConnct'

export type RejectFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: {
    reason: string
    subject: string
    category: string
    notifySender: boolean
  }) => Promise<void> | void
  isSubmitting?: boolean
  title?: string
  description?: string
  requireReason?: boolean
  maxLength?: number
  placeholder?: string
  isClose?: boolean
  viewOnly?: boolean
  initialReason?: string
  initialSubject?: string
  initialCategory?: string
  initialNotifySender?: boolean
}

export function RejectForm({
  open,
  onOpenChange,
  isClose,
  onSubmit,
  isSubmitting = false,
  title = 'Reject document',
  description = 'Please provide a reason for rejecting this document. The sender will be notified.',
  requireReason = true,
  maxLength = 500,
  placeholder = 'write your reason why you are rejecting this document',
  viewOnly = false,
  initialReason,
  initialSubject,
  initialCategory,
  initialNotifySender,
}: RejectFormProps) {
  const [reason, setReason] = React.useState('')
  const [subject, setSubject] = React.useState('Reject document')
  const [category, setCategory] = React.useState('')
  const [notifySender, setNotifySender] = React.useState(true)
  const [touched, setTouched] = React.useState(false)

  const remaining = maxLength - reason.length
  const invalidReason = viewOnly
    ? false
    : (requireReason && reason.trim().length < 10) || reason.length > maxLength
  const invalidSubject = viewOnly
    ? false
    : subject.trim().length < 3 || subject.trim().length > 100
  const invalidCategory = viewOnly ? false : category.trim().length === 0
  const invalid = viewOnly ? false : invalidReason || invalidSubject || invalidCategory

  const handleClose = () => {
    if (isSubmitting) return
    onOpenChange(false)
    setTouched(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (invalid) return
    await Promise.resolve(
      onSubmit({
        reason: reason.trim(),
        subject: subject.trim(),
        category,
        notifySender,
      }),
    )
  }

  React.useEffect(() => {
    if (!open) {
      setReason('')
      setSubject('Reject document')
      setCategory('')
      setNotifySender(true)
      return
    }

    if (viewOnly) {
      setReason(initialReason ?? '')
      setSubject(initialSubject ?? 'Reject document')
      setCategory(initialCategory ?? '')
      setNotifySender(initialNotifySender ?? true)
    }
  }, [open, viewOnly, initialReason, initialSubject, initialCategory, initialNotifySender])
const subjectOptions = [
  { value: 'WRONG_RECIPIENT', label: 'Wrong recipient' },
  { value: 'WRONG_VERSION', label: 'Wrong version' },
  { value: 'MISSING_INFO', label: 'Missing information' },
  { value: 'OTHER', label: 'Other' },
]

  return (
    <Dialog open={open}>
      <DialogContent
        className='sm:max-w-md'
        onOpenChange={handleClose}
        hideClose={!isClose}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <div className='mt-4 space-y-4'>
            {/* <div className='space-y-2'>
              <Label
                htmlFor='reject-subject'
                className='font-medium text-black'
              >
                Subject
              </Label>
              <Input
                id='reject-subject'
                value={subject}
                className='mt-1'
                onChange={(e) => setSubject(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder='Brief summary (e.g., Rejecting due to wrong version)'
                disabled={isSubmitting}
              />
              {touched && invalidSubject && (
                <p className='text-xs text-destructive'>
                  Subject must be 3-100 characters
                </p>
              )}
            </div> */}

            <div className='space-y-2'>
              <Label className={cn('font-medium text-black', viewOnly && 'text-black')}>Subject</Label>
              <div className='mt-1'>
                {viewOnly ? (
            <Input
              id='reject-reason'
              value={subjectOptions.find((option) => option.value === category)?.label}
           
              placeholder={ 'Select any one'}
              className='mt-1 disabled:opacity-100 disabled:text-black'
           
              disabled={isSubmitting || viewOnly}
            />
                ): (

                <Select
                  value={category}
                  onValueChange={viewOnly ? () => {} : setCategory}
                >
                  <SelectTrigger disabled={isSubmitting || viewOnly} className='disabled:opacity-100 disabled:text-black'>
                    <SelectValue placeholder='Select any one' />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    
                  </SelectContent>
                </Select>
                )
                  
                }
              </div>
              {!viewOnly && touched && invalidCategory && (
                <p className='text-xs text-destructive'>
                  Please select a subject
                </p>
              )}
            </div>

            <Label htmlFor='reject-reason' className={cn('font-medium text-black', viewOnly && 'text-black')}>
              Reason
            </Label>
            <Textarea
              id='reject-reason'
              value={reason}
              onChange={viewOnly ? () => {} : (e) => setReason(e.target.value)}
              onBlur={() => (!viewOnly ? setTouched(true) : null)}
              placeholder={placeholder}
              className={cn('mt-1 min-h-28', viewOnly && 'disabled:opacity-100 disabled:text-black')}
              maxLength={maxLength + 1}
              disabled={isSubmitting || viewOnly}
            />
            {!viewOnly && (
              <div className='flex justify-between items-center text-xs text-muted-foreground'>
                <span>
                  {requireReason && touched && invalidReason ? (
                    <span className='text-destructive'>
                      Reason must be at least 10 characters
                    </span>
                  ) : null}
                  {reason.length > maxLength ? (
                    <span className='text-destructive'> Exceeded limit</span>
                  ) : null}
                </span>
                <span className={remaining < 0 ? 'text-destructive' : ''}>
                  {remaining} left
                </span>
              </div>
            )}

            {!viewOnly && (
              <div className='flex gap-2 items-center pt-2'>
                <Checkbox
                  id='notify-sender'
                  checked={notifySender}
                  onCheckedChange={(v: boolean) => setNotifySender(!!v)}
                  disabled={isSubmitting}
                />
                <Label htmlFor='notify-sender' className='font-medium text-black'>
                  Notify sender by email
                </Label>
              </div>
            )}
          </div>

          {!viewOnly ? (
            <DialogFooter className='mt-6'>
              <Button
                type='submit'
                className='w-full bg-[#D92D20] text-white'
                variant='destructive'
                loading={isSubmitting}
                disabled={invalid || isSubmitting}
              >
                Reject Document
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter className='mt-6'>
              <Button
                type='button'
                className='w-full'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RejectForm
