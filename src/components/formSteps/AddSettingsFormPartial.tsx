'use client'
import { usePDFContext } from '@/context/PDFContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useStep } from '../ui/stepper'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import {
  DocumentFlowFormContainerActions,
  DocumentFlowFormContainerContent,
  DocumentFlowFormContainerFooter,
  DocumentFlowFormContainerHeader,
  DocumentFlowStepper,
} from './DocumentFlowRoot'
import { DocumentReadOnlyFields } from './document-read-only-fields'
import { Recipient } from '../schema/types'
import { RotateCcw, FileSignature } from 'lucide-react'
import { MultiSelectCombobox } from '../ui/multi-select-combobox'
import { DATE_FORMATS } from '../ui/date-formats'
import { TIME_ZONES } from '../ui/time-zones'
import EnableSigningOrderDialog from './EnableSigningOrderDialog' // Import the dialog

const InfoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <circle cx='12' cy='12' r='10' />
    <path d='M12 16v-4m0-4h.01' />
  </svg>
)

const DocumentGlobalAuthAccessSelect = ({
  value,
  onValueChange,
  disabled,
}: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) => (
  <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value='PUBLIC'>Public</SelectItem>
      <SelectItem value='PRIVATE'>Private</SelectItem>
    </SelectContent>
  </Select>
)

const DocumentVisibilitySelect = ({
  value,
  onValueChange,
  disabled,
  canUpdateVisibility,
}: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  canUpdateVisibility?: boolean
}) => (
  <Select
    value={value}
    onValueChange={onValueChange}
    disabled={disabled || !canUpdateVisibility}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value='TEAM'>Team</SelectItem>
      <SelectItem value='PUBLIC'>Public</SelectItem>
    </SelectContent>
  </Select>
)

const DocumentGlobalAuthActionSelect = ({
  value,
  onValueChange,
  disabled,
}: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) => (
  <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value='NONE'>None</SelectItem>
      <SelectItem value='EMAIL'>Email</SelectItem>
    </SelectContent>
  </Select>
)

const DocumentGlobalAuthAccessTooltip = () => (
  <Tooltip>
    <TooltipTrigger>
      <InfoIcon className='mx-2 w-4 h-4' />
    </TooltipTrigger>
    <TooltipContent className='max-w-xs text-muted-foreground'>
      Controls document access permissions.
    </TooltipContent>
  </Tooltip>
)

const DocumentVisibilityTooltip = () => (
  <Tooltip>
    <TooltipTrigger>
      <InfoIcon className='mx-2 w-4 h-4' />
    </TooltipTrigger>
    <TooltipContent className='max-w-xs text-muted-foreground'>
      Controls document visibility for team members.
    </TooltipContent>
  </Tooltip>
)

const DocumentGlobalAuthActionTooltip = () => (
  <Tooltip>
    <TooltipTrigger>
      <InfoIcon className='mx-2 w-4 h-4' />
    </TooltipTrigger>
    <TooltipContent className='max-w-xs text-muted-foreground'>
      Specifies authentication required for recipient actions.
    </TooltipContent>
  </Tooltip>
)

const DocumentSignatureSettingsTooltip = () => (
  <Tooltip>
    <TooltipTrigger>
      <InfoIcon className='mx-2 w-4 h-4' />
    </TooltipTrigger>
    <TooltipContent className='max-w-xs text-muted-foreground'>
      Select allowed signature types for the document.
    </TooltipContent>
  </Tooltip>
)

// Placeholder data
const SUPPORTED_LANGUAGES = {
  en: { full: 'English' },
  fr: { full: 'French' },
  es: { full: 'Spanish' },
}

const DOCUMENT_SIGNATURE_TYPES = {
  handwritten: { label: 'Handwritten', value: 'handwritten' },
  typed: { label: 'Typed', value: 'typed' },
  draw_upload: { label: 'Draw & Upload', value: 'draw_upload' },
}

// Form schema
const settingsSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  meta: z.object({
    language: z.string().optional(),
    signatureTypes: z.array(z.string()).min(1, 'At least one signature type is required'), // Updated to require at least one
    dateFormat: z.string().optional(),
    timezone: z.string().optional(),
    redirectUrl: z.string().url().optional().or(z.literal('')),
  }),
  globalAccessAuth: z.string().optional(),
  visibility: z.string().optional(),
  globalActionAuth: z.string().optional(),
  externalId: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface Document {
  id: string
  title: string
  file: string
  recipients: Recipient[]
  fileType: string
  signingOrder?: 'SEQUENTIAL' | 'PARALLEL'
}

const AddSettingsFormPartial = ({
  document,
  setShowUploadModal,
  setDocument
}: {
  document: Document
  setShowUploadModal: (value: boolean) => void
  setDocument: (document: Document) => void
}) => {
  const { nextStep, previousStep, isFirst } = useStep()
  const { updateStepData, getStepData } = usePDFContext()
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [nextSignerEmail, setNextSignerEmail] = useState<string | null>(null)

  // Mock data (replace with actual data)
  const stepData = getStepData(1)
  const organisation = { organisationClaim: { flags: { cfr21: true } } }
  const currentTeamMemberRole = 'ADMIN'
  const canUpdateVisibility = true
  const documentHasBeenSent = false
  const user = { data: { email: 'alice.johnson@example.com' } } // Mock user for signing logic
  const recipient = null // Mock recipient for signing logic

  // Define default signature types (all selected)
  const defaultSignatureTypes = Object.values(DOCUMENT_SIGNATURE_TYPES).map(
    (type) => type.value
  )

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      title: '',
      meta: {
        language: 'en',
        signatureTypes: defaultSignatureTypes, // All signature types selected by default
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC',
        redirectUrl: '',
      },
      globalAccessAuth: 'PUBLIC',
      visibility: 'TEAM',
      globalActionAuth: 'NONE',
      externalId: '',
    },
  })

  // Use useEffect to set form values when stepData or document changes
  useEffect(() => {
    form.reset({
      title: stepData?.title || document?.title || '',
      meta: {
        language: stepData?.meta?.language || 'en',
        signatureTypes: stepData?.meta?.signatureTypes?.length
          ? stepData.meta.signatureTypes
          : defaultSignatureTypes, // Use stepData if available, else all types
        dateFormat: stepData?.meta?.dateFormat || 'MM/DD/YYYY',
        timezone: stepData?.meta?.timezone || 'UTC',
        redirectUrl: stepData?.meta?.redirectUrl || '',
      },
      globalAccessAuth: stepData?.globalAccessAuth || 'PUBLIC',
      visibility: stepData?.visibility || 'TEAM',
      globalActionAuth: stepData?.globalActionAuth || 'NONE',
      externalId: stepData?.externalId || '',
    })
  }, [stepData, document?.title, form])

  // Signing order logic
  useEffect(() => {
    if (document.signingOrder === 'SEQUENTIAL' && document.recipients?.length) {
      const signerEmail = (recipient || user?.data?.email)?.trim().toLowerCase()
      const sortedSigners = [...document.recipients].sort(
        (a, b) => a.signingOrder - b.signingOrder
      )

      const currentUser = sortedSigners.find(
        (signer) =>
          signer.email.trim().toLowerCase() === signerEmail &&
          signer.role === 'SIGNER'
      )



      if (currentUser.signingOrder === 3) {
        const signer1 = sortedSigners.find((signer) => signer.signingOrder === 1)
        const signer2 = sortedSigners.find((signer) => signer.signingOrder === 2)

        if (signer1?.status !== 'SIGNED' && signer2?.status !== 'SIGNED') {
          setIsDialogOpen(true)
          setNextSignerEmail(signer1?.email || null)
          return
        }

        if (signer1?.status === 'SIGNED' && signer2?.status !== 'SIGNED') {
          setIsDialogOpen(true)
          setNextSignerEmail(signer2?.email || null)
          return
        }

        if (signer1?.status === 'SIGNED' && signer2?.status === 'SIGNED') {
          setIsDialogOpen(false)
          setNextSignerEmail(null)
          return
        }
      }

      const nextSignerIndex = sortedSigners.findIndex(
        (signer) => signer.role === 'SIGNER' && signer.status !== 'SIGNED'
      )

      if (nextSignerIndex === -1) {
        setIsDialogOpen(false)
        setNextSignerEmail(null)
        return
      }

      const isCurrentUserNext =
        sortedSigners[nextSignerIndex]?.email.trim().toLowerCase() === signerEmail
      const previousSignerSigned =
        nextSignerIndex === 0 || sortedSigners[nextSignerIndex - 1]?.status === 'SIGNED'

      if (isCurrentUserNext && previousSignerSigned) {
        setIsDialogOpen(false)
        setNextSignerEmail(null)
      } else {
        setIsDialogOpen(true)
        setNextSignerEmail(sortedSigners[nextSignerIndex]?.email || null)
      }
    } else {
      setIsDialogOpen(false)
      setNextSignerEmail(null)
    }
  }, [document, recipient, user])

  const onSubmit = (data: SettingsFormValues) => {
    console.log('Settings submitted:', data)
    
    // Update the document with the new title and documentSignData
    const updatedDocument = {
      ...document,
      title: data.title,
      documentSignData: {
        ...document.documentSignData,
        "0": {
          ...document.documentSignData?.["0"],
          data: {
            ...document.documentSignData?.["0"]?.data,
            title: data.title
          }
        }
      }
    }
    
    setDocument(updatedDocument)
    updateStepData(1, data)
    nextStep()
  }

  const onGoNextClick = form.handleSubmit(onSubmit)

  return (
    <>
      <DocumentFlowStepper currentStepIndex={1} />
      <div className='flex justify-between items-center'>
        <DocumentFlowFormContainerHeader
          title='General'
          disableLine={true}
          description='Configure general settings for the document.'
        />
        {document.status === 'DRAFT' && (
          <button
            className='inline-flex z-[999999] justify-center items-center px-3 py-1.5 text-xs font-medium text-white rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50'
            onClick={() => setShowUploadModal(true)}
          >
            <RotateCcw className='w-3 h-3 mr-1.5' />
            Change Document
          </button>
        )}
      </div>
      <hr className='my-2.5 border-border' />

      <DocumentFlowFormContainerContent>
        <DocumentReadOnlyFields />
        <Form {...form}>
          <fieldset
            className='flex flex-col space-y-2.5 h-full'
            disabled={form.formState.isSubmitting}
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-black' required>
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input className='bg-white' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name='meta.language'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='inline-flex items-center text-black'>
                    Language
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className='mx-2 w-4 h-4' />
                      </TooltipTrigger>
                      <TooltipContent className='p-4 space-y-2 max-w-md text-foreground'>
                        Controls the language for the document, including the
                        language to be used for email notifications, and the
                        final certificate that is generated and attached to the
                        document.
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      disabled={field.disabled}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className='bg-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, language]) => (
                          <SelectItem key={code} value={code}>
                            {language.full}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            {/* <FormField
              control={form.control}
              name='globalAccessAuth'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex flex-row items-center text-black'>
                    Document access
                    <DocumentGlobalAuthAccessTooltip />
                  </FormLabel>
                  <FormControl>
                    <DocumentGlobalAuthAccessSelect
                      value={field.value}
                      disabled={field.disabled}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}
            {currentTeamMemberRole && (
              <FormField
                control={form.control}
                name='visibility'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex flex-row items-center text-black'>
                      Document visibility
                      <DocumentVisibilityTooltip />
                    </FormLabel>
                    <FormControl>
                      <DocumentVisibilitySelect
                        canUpdateVisibility={canUpdateVisibility}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {/* {organisation.organisationClaim.flags.cfr21 && (
              <FormField
                control={form.control}
                name='globalActionAuth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex flex-row items-center text-gray-700'>
                      Recipient action authentication
                      <DocumentGlobalAuthActionTooltip />
                    </FormLabel>
                    <FormControl>
                      <DocumentGlobalAuthActionSelect
                        value={field.value}
                        disabled={field.disabled}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )} */}
            <Accordion type='multiple' className='pt-2 border-t'>
              <AccordionItem value='advanced-options' className='border-none'>
                <AccordionTrigger className='px-3 py-2 mb-2 text-left rounded text-foreground hover:bg-neutral-200/30 hover:no-underline'>
                  Advanced Options
                </AccordionTrigger>
                <AccordionContent className='px-1 pt-2 -mx-1 text-sm leading-relaxed text-muted-foreground'>
                  <div className='flex flex-col space-y-6'>
                    {/* <FormField
                      control={form.control}
                      name='externalId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex flex-row items-center text-black'>
                            External ID
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className='mx-2 w-4 h-4' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs text-muted-foreground'>
                                Add an external ID to the document. This can be
                                used to identify the document in external systems.
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input className='bg-white' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                    <FormField
                      control={form.control}
                      name='meta.signatureTypes'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex flex-row items-center text-black'>
                            Allowed Signature Types
                            <DocumentSignatureSettingsTooltip />
                          </FormLabel>
                          <FormControl>
                            <MultiSelectCombobox
                              enableSearch={false}
                              options={Object.values(DOCUMENT_SIGNATURE_TYPES).map(
                                (option) => ({
                                  label: option.label,
                                  value: option.value,
                                })
                              )}
                              selectedValues={field.value}
                              onChange={field.onChange}
                              className='w-full bg-background'
                              emptySelectionPlaceholder='Select signature types'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='meta.dateFormat'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-black'>
                            Date Format
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={documentHasBeenSent}
                            >
                              <SelectTrigger className='bg-white'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DATE_FORMATS.map((format) => (
                                  <SelectItem
                                    key={format.key}
                                    value={format.value}
                                  >
                                    {format.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='meta.timezone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-black'>
                            Time Zone
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              disabled={field.disabled}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className='bg-white'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className='max-h-[200px] overflow-y-auto'>
                                {Object.entries(TIME_ZONES).map(([code, language]) => (
                                  <SelectItem key={code} value={code}>
                                    {language}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* <FormField
                      control={form.control}
                      name='meta.redirectUrl'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex flex-row items-center text-gray-700'>
                            Redirect URL
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className='mx-2 w-4 h-4' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs text-muted-foreground'>
                                Add a URL to redirect the user to once the
                                document is signed
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input className='bg-white' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </fieldset>
        </Form>
      </DocumentFlowFormContainerContent>
      <DocumentFlowFormContainerFooter>
        <DocumentFlowFormContainerActions
          loading={form.formState.isSubmitting}
          disabled={form.formState.isSubmitting}
          canGoBack={!isFirst}
          onGoBackClick={previousStep}
          onGoNextClick={onGoNextClick}
        />
      </DocumentFlowFormContainerFooter>
     
    </>
  )
}

export default AddSettingsFormPartial