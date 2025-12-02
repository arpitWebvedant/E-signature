import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type SuccessDeleteDialogProps = {
  open: boolean
  setOpen: (val: boolean) => void
  onConfirm?: () => void
}

const SuccessDeleteDialog = ({ open, setOpen, onConfirm }: SuccessDeleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center space-y-2 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="48" rx="24" fill="#DC2626" fillOpacity="0.1" />
            <path
              d="M16 24L22 30L34 18"
              stroke="#DC2626"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <DialogTitle>Document Deleted Successfully</DialogTitle>
          <p className="text-sm text-muted-foreground">
            The document has been permanently removed.
          </p>
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <Button onClick={() => { setOpen(false); onConfirm?.() }}>
            Back to Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SuccessDeleteDialog
