import { InfoIcon } from 'lucide-react'
import { cn } from '../lib/ClsxConnct'
import {
  DocumentEmailEvents,
  TDocumentEmailSettings,
} from '../schema/document-email'
import { Checkbox } from '../ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

type Value = TDocumentEmailSettings

type DocumentEmailCheckboxesProps = {
  value: Value
  onChange: (value: Value) => void
  className?: string
}

export const DocumentEmailCheckboxes = ({
  value,
  onChange,
  className,
}: DocumentEmailCheckboxesProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className='flex flex-row items-center'>
        <Checkbox
          id={DocumentEmailEvents.RecipientSigned}
          className='w-5 h-5'
          checked={value.recipientSigned}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              [DocumentEmailEvents.RecipientSigned]: Boolean(checked),
            })
          }
        />

        <label
          className='flex flex-row items-center ml-2 text-sm text-muted-foreground'
          htmlFor={DocumentEmailEvents.RecipientSigned}
        >
          Send recipient signed email
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='mx-2 w-4 h-4' />
            </TooltipTrigger>

            <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
              <h2>
                <strong>Recipient signed email</strong>
              </h2>

              <p>
                This email is sent to the document owner when a recipient has
                signed the document.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
      </div>

      <div className='flex flex-row items-center'>
        <Checkbox
          id={DocumentEmailEvents.RecipientSigningRequest}
          className='w-5 h-5'
          checked={value.recipientSigningRequest}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              [DocumentEmailEvents.RecipientSigningRequest]: Boolean(checked),
            })
          }
        />

        <label
          className='flex flex-row items-center ml-2 text-sm text-muted-foreground'
          htmlFor={DocumentEmailEvents.RecipientSigningRequest}
        >
          Send recipient signing request email
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='mx-2 w-4 h-4' />
            </TooltipTrigger>

            <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
              <h2>
                <strong>Recipient signing request email</strong>
              </h2>

              <p>
                This email is sent to the recipient requesting them to sign the
                document.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
      </div>

      <div className='flex flex-row items-center'>
        <Checkbox
          id={DocumentEmailEvents.RecipientRemoved}
          className='w-5 h-5'
          checked={value.recipientRemoved}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              [DocumentEmailEvents.RecipientRemoved]: Boolean(checked),
            })
          }
        />

        <label
          className='flex flex-row items-center ml-2 text-sm text-muted-foreground'
          htmlFor={DocumentEmailEvents.RecipientRemoved}
        >
          Send recipient removed email
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='mx-2 w-4 h-4' />
            </TooltipTrigger>

            <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
              <h2>
                <strong>Recipient removed email</strong>
              </h2>

              <p>
                This email is sent to the recipient if they are removed from a
                pending document.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
      </div>

      <div className='flex flex-row items-center'>
        <Checkbox
          id={DocumentEmailEvents.DocumentPending}
          className='w-5 h-5'
          checked={value.documentPending}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              [DocumentEmailEvents.DocumentPending]: Boolean(checked),
            })
          }
        />

        <label
          className='flex flex-row items-center ml-2 text-sm text-muted-foreground'
          htmlFor={DocumentEmailEvents.DocumentPending}
        >
          Send document pending email
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='mx-2 w-4 h-4' />
            </TooltipTrigger>

            <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
              <h2>
                <strong>Document pending email</strong>
              </h2>

              <p>
                This email will be sent to the recipient who has just signed the
                document, if there are still other recipients who have not
                signed yet.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
      </div>

      <div className='flex flex-row items-center'>
        <Checkbox
          id={DocumentEmailEvents.DocumentCompleted}
          className='w-5 h-5'
          checked={value.documentCompleted}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              [DocumentEmailEvents.DocumentCompleted]: Boolean(checked),
            })
          }
        />

        <label
          className='flex flex-row items-center ml-2 text-sm text-muted-foreground'
          htmlFor={DocumentEmailEvents.DocumentCompleted}
        >
          Send document completed email
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='mx-2 w-4 h-4' />
            </TooltipTrigger>

            <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
              <h2>
                <strong>Document completed email</strong>
              </h2>

              <p>
                This will be sent to all recipients once the document has been
                fully completed.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
      </div>

      <div className='flex flex-row items-center'>
        <Checkbox
          id={DocumentEmailEvents.DocumentDeleted}
          className='w-5 h-5'
          checked={value.documentDeleted}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              [DocumentEmailEvents.DocumentDeleted]: Boolean(checked),
            })
          }
        />

        <label
          className='flex flex-row items-center ml-2 text-sm text-muted-foreground'
          htmlFor={DocumentEmailEvents.DocumentDeleted}
        >
          Send document deleted email
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='mx-2 w-4 h-4' />
            </TooltipTrigger>

            <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
              <h2>
                <strong>Document deleted email</strong>
              </h2>

              <p>
                This will be sent to all recipients if a pending document has
                been deleted.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
      </div>

      <div className='flex flex-row items-center'>
        <Checkbox
          id={DocumentEmailEvents.OwnerDocumentCompleted}
          className='w-5 h-5'
          checked={value.ownerDocumentCompleted}
          onCheckedChange={(checked) =>
            onChange({
              ...value,
              [DocumentEmailEvents.OwnerDocumentCompleted]: Boolean(checked),
            })
          }
        />

        <label
          className='flex flex-row items-center ml-2 text-sm text-muted-foreground'
          htmlFor={DocumentEmailEvents.OwnerDocumentCompleted}
        >
          Send document completed email to the owner
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='mx-2 w-4 h-4' />
            </TooltipTrigger>

            <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
              <h2>
                <strong>Document completed email</strong>
              </h2>

              <p>
                This will be sent to the document owner once the document has
                been fully completed.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
      </div>
    </div>
  )
}
