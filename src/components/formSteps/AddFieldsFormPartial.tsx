'use client'

import { useGlobalContext } from '@/context/GlobalContext'
import { usePDFContext } from '@/context/PDFContext'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Contact,
  Disc,
  Hash,
  Mail,
  Type,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import { useRecipientColors } from '../common/recipient-colors'
import { PDF_VIEWER_PAGE_SELECTOR } from '../constants/pdf-viewer'
import { useDocumentElement } from '../formSteps/meta/use-document-element'
import { cn } from '../lib/ClsxConnct'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { FieldAdvancedSettings } from './field-item-advanced-settings'
import { Form } from '../ui/form'
import { useStep } from '../ui/stepper'
import {
  DocumentFlowFormContainerActions,
  DocumentFlowFormContainerContent,
  DocumentFlowFormContainerFooter,
  DocumentFlowFormContainerHeader,
  DocumentFlowFormContainerStep,
  DocumentFlowStepper,
} from './DocumentFlowRoot'
import { FieldItem } from './field-item'
import { TAddFieldsFormSchema } from './meta/add-fields.types'
import { getBoundingClientRect } from './meta/get-bounding-client-rect'
import { nanoid } from './nanoid'
import { RecipientSelector } from './recipient-selector'
import { ZFieldMetaSchema } from './meta/field-meta'
import { useAutoSave } from '@/hooks/use-autosave'

// Types
type FieldType = keyof typeof FieldType
const FieldType = {
  SIGNATURE: 'SIGNATURE',
  INITIALS: 'INITIALS',
  EMAIL: 'EMAIL',
  NAME: 'NAME',
  DATE: 'DATE',
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  RADIO: 'RADIO',
  CHECKBOX: 'CHECKBOX',
  DROPDOWN: 'DROPDOWN',
} as const

interface Recipient {
  id: number
  name: string
  email: string
  role: string
  sendStatus: string
  signingOrder: number
  documentId: number
  templateId: number | null
  documentDeletedAt: string | null
  expiredAt: string | null
  readStatus: string
  rejectionReason: string | null
  signedAt: string | null
  signingStatus: string
  token: string
}

interface Field {
  id: number
  formId: string
  type: string
  pageNumber: number
  pageX: number
  pageY: number
  pageWidth: number
  pageHeight: number
  recipient: { name: string; email: string }
  signerEmail: string
  fieldMeta?: any
  customText?: string
  inserted?: boolean
  documentId?: string
  recipientId?: number
  signature?: string
  templateId?: number
  width?: number
  height?: number
}

interface AddFieldsFormProps {
  documentFlow: DocumentFlowStep
  hideRecipients?: boolean
  recipients: Recipient[]
  fields: Field[]
  onSubmit: (data: TAddFieldsFormSchema) => void
  canGoBack?: boolean
  isDocumentPdfLoaded: boolean
  teamId: number
}

// Form Schema
const fieldsSchema = z.object({
  fields: z.array(
    z.object({
      formId: z.string(),
      type: z.enum(Object.values(FieldType) as [string, ...string[]]),
      pageNumber: z.number().min(1),
      pageX: z.number(),
      pageY: z.number(),
      pageWidth: z.number(),
      pageHeight: z.number(),
      recipient: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      signerEmail: z.string().email(),
      fieldMeta: z.any().optional(),
    }),
  ),
})

type FieldsFormValues = z.infer<typeof fieldsSchema>

// Constants
const FRIENDLY_FIELD_TYPE: Record<FieldType, string> = {
  SIGNATURE: 'Signature',
  INITIALS: 'Initials',
  EMAIL: 'Email',
  NAME: 'Name',
  DATE: 'Date',
  TEXT: 'Text',
  NUMBER: 'Number',
  RADIO: 'Radio',
  CHECKBOX: 'Checkbox',
  DROPDOWN: 'Dropdown',
}

const MIN_HEIGHT_PX = 12
const MIN_WIDTH_PX = 36
const DEFAULT_HEIGHT_PX = MIN_HEIGHT_PX * 2.5
const DEFAULT_WIDTH_PX = MIN_WIDTH_PX * 2.5
const ADVANCED_FIELD_SETTINGS: FieldType[] = [
  'NUMBER',
  'TEXT',
  'DROPDOWN',
  'RADIO',
  'CHECKBOX',
]

// Field Type Configuration
const FIELD_TYPE_CONFIG = [
  {
    type: FieldType.SIGNATURE,
    label: 'Signature',
    icon: null,
    className: 'font-signature text-lg',
  },
  { type: FieldType.INITIALS, label: 'Initials', icon: Contact },
  { type: FieldType.EMAIL, label: 'Email', icon: Mail },
  { type: FieldType.NAME, label: 'Name', icon: User },
  { type: FieldType.DATE, label: 'Date', icon: CalendarDays },
  { type: FieldType.TEXT, label: 'Text', icon: Type },
  { type: FieldType.NUMBER, label: 'Number', icon: Hash },
  { type: FieldType.RADIO, label: 'Radio', icon: Disc },
  { type: FieldType.CHECKBOX, label: 'Checkbox', icon: CheckSquare },
  { type: FieldType.DROPDOWN, label: 'Dropdown', icon: ChevronDown },
]

// Components
interface FieldButtonProps {
  type: FieldType
  label: string
  icon: React.ComponentType<{ className: string }> | null
  className?: string
  isSelected: boolean
  onClick: (type: FieldType) => void
}

const FieldButton: React.FC<FieldButtonProps> = ({
  type,
  label,
  icon: Icon,
  className,
  isSelected,
  onClick,
}) => (
  <button
    type='button'
    className='w-full h-full group'
    onClick={() => onClick(type)}
    onMouseDown={() => onClick(type)}
    data-selected={isSelected ? true : undefined}
  >
    <Card className='flex justify-center items-center w-full h-full bg-white border-2 border-spacing-[7px] border-dashed cursor-pointer border-signature-border group-disabled:opacity-50'>
      <CardContent className='py-2.5'>
        <p
          className={cn(
            'text-muted-foreground group-data-[selected]:text-foreground flex items-center justify-center gap-x-1.5 text-sm font-normal',
            className,
          )}
        >
          {Icon && <Icon className='w-4 h-4' />}
          {label}
        </p>
      </CardContent>
    </Card>
  </button>
)

const AddFieldsFormPartial: React.FC<AddFieldsFormProps> = ({
  hideRecipients = false,
  recipients,
  onAutoSave,
}) => {
 
  const { nextStep, previousStep, isFirst, currentStep, totalSteps } = useStep()
  const { updateStepData, getStepData } = usePDFContext()
  const { user } = useGlobalContext()
  const { isWithinPageBounds, getFieldPosition, getPage } = useDocumentElement()
  const [selectedField, setSelectedField] = useState<FieldType | null>(null)
  const [selectedSigner, setSelectedSigner] = useState<Recipient | null>(null)
  const [isFieldWithinBounds, setIsFieldWithinBounds] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [lastActiveField, setLastActiveField] = useState<
    TAddFieldsFormSchema['fields'][0] | null
  >(null)
  const [currentField, setCurrentField] = useState<
    TAddFieldsFormSchema['fields'][0] | null
  >(null)
  const [hasErrors, setHasErrors] = useState(false)

  const stepData = getStepData(3)
  const form = useForm<FieldsFormValues>({
    resolver: zodResolver(fieldsSchema),
    defaultValues: { fields: stepData?.fields || [] },
  })

  const {
    append,
    remove,
    update,
    fields: localFields,
  } = useFieldArray({
    control: form.control,
    name: 'fields',
  })

  const selectedSignerIndex = selectedSigner
    ? recipients.findIndex((r) => r.id === selectedSigner.id)
    : -1
  // const selectedSignerStyles = useRecipientColors(
  //   selectedSignerIndex === -1 ? 0 : selectedSignerIndex,
  // )
  const selectedSignerStyles = useRecipientColors(selectedSignerIndex)
  const fieldBounds = useRef({
    height: DEFAULT_HEIGHT_PX,
    width: DEFAULT_WIDTH_PX,
  })
  const { scheduleSave } = useAutoSave(onAutoSave)
  // Event Handlers
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      setIsFieldWithinBounds(
        isWithinPageBounds(
          event,
          PDF_VIEWER_PAGE_SELECTOR,
          fieldBounds.current.width,
          fieldBounds.current.height,
        ),
      )
      setCoords({
        x: event.clientX - fieldBounds.current.width / 2,
        y: event.clientY - fieldBounds.current.height / 2,
      })
    },
    [isWithinPageBounds],
  )

  const handleMouseClick = useCallback(
    (event: MouseEvent) => {
      if (!selectedField || !selectedSigner) return

      const $page = getPage(event, PDF_VIEWER_PAGE_SELECTOR)
      if (
        !$page ||
        !isWithinPageBounds(
          event,
          PDF_VIEWER_PAGE_SELECTOR,
          fieldBounds.current.width,
          fieldBounds.current.height,
        )
      ) {
        setSelectedField(null)
        return
      }

      const { top, left, height, width } = getBoundingClientRect($page)
      const pageNumber = parseInt(
        $page.getAttribute('data-page-number') ?? '1',
        10,
      )
      const pageX =
        ((event.pageX - left) / width) * 100 -
        ((fieldBounds.current.width / width) * 100) / 2
      const pageY =
        ((event.pageY - top) / height) * 100 -
        ((fieldBounds.current.height / height) * 100) / 2

      const newField: TAddFieldsFormSchema['fields'][0] = {
        formId: nanoid(12),
        type: selectedField,
        pageNumber,
        pageX,
        pageY,
        zIndex: 99999,
        pageWidth: (fieldBounds.current.width / width) * 100,
        pageHeight: (fieldBounds.current.height / height) * 100,
        recipient: {
          name: user?.data?.name ?? '',
          email: user?.data?.email ?? '',
        },
        signerEmail: selectedSigner.email,
        fieldMeta: undefined,
      }

      append(newField)
      if (ADVANCED_FIELD_SETTINGS.includes(selectedField)) {
        setCurrentField(newField)
        setShowAdvancedSettings(true)
      }
      setIsFieldWithinBounds(false)
      setSelectedField(null)
    },
    [
      append,
      selectedField,
      selectedSigner,
      user?.data?.name,
      user?.data?.email,
    ],
  )

  const handleFieldResize = useCallback(
    (node: HTMLElement, index: number) => {
      const field = localFields[index]
      const $page = document.querySelector<HTMLElement>(
        `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.pageNumber}"]`,
      )
      if (!$page) return

      const {
        x: pageX,
        y: pageY,
        width: pageWidth,
        height: pageHeight,
      } = getFieldPosition($page, node)
      update(index, { ...field, pageX, pageY, pageWidth, pageHeight })
    },
    [getFieldPosition, localFields, update],
  )

  const handleFieldMove = useCallback(
    (node: HTMLElement, index: number) => {
      const field = localFields[index]
      const $page = document.querySelector<HTMLElement>(
        `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${field.pageNumber}"]`,
      )
      if (!$page) return

      const { x: pageX, y: pageY } = getFieldPosition($page, node)
      update(index, { ...field, pageX, pageY })
    },
    [getFieldPosition, localFields, update],
  )

  const handleFieldCopy = useCallback(
    (
      event?: KeyboardEvent | null,
      options?: { duplicate?: boolean; duplicateAll?: boolean },
    ) => {
      const { duplicate = false, duplicateAll = false } = options ?? {}
      if (!lastActiveField) return

      event?.preventDefault()
      if (duplicate) {
        const newField: TAddFieldsFormSchema['fields'][0] = {
          ...structuredClone(lastActiveField),
          formId: nanoid(12),
          recipient: {
            name: user?.data?.name ?? '',
            email: user?.data?.email ?? '',
          },
          signerEmail: selectedSigner?.email ?? lastActiveField.signerEmail,
          pageX: lastActiveField.pageX + 3,
          pageY: lastActiveField.pageY + 3,
        }
        append(newField)
        return
      }

      if (duplicateAll) {
        const pages = Array.from(
          document.querySelectorAll(PDF_VIEWER_PAGE_SELECTOR),
        )
        pages.forEach((_, index) => {
          const pageNumber = index + 1
          if (pageNumber === lastActiveField.pageNumber) return

          const newField: TAddFieldsFormSchema['fields'][0] = {
            ...structuredClone(lastActiveField),
            formId: nanoid(12),
            pageNumber,
            recipient: {
              name: user?.data?.name ?? '',
              email: user?.data?.email ?? '',
            },
            signerEmail: selectedSigner?.email ?? lastActiveField.signerEmail,
          }
          append(newField)
        })
        return
      }

      console.log({
        title: 'Copied field',
        description: 'Copied field to clipboard',
      })
    },
    [
      append,
      lastActiveField,
      selectedSigner,
      user?.data?.name,
      user?.data?.email,
    ],
  )
  const handleSavedFieldSettings = (fieldState: FieldMeta) => {
    const initialValues = form.getValues()

    const updatedFields = initialValues.fields.map((field) => {
      if (field.formId === currentField?.formId) {
        const parsedFieldMeta = ZFieldMetaSchema.parse(fieldState)

        return {
          ...field,
          fieldMeta: parsedFieldMeta,
        }
      }

      return field
    })

    form.setValue('fields', updatedFields)
  }
  const handleAutoSave = async () => {
    const isFormValid = await form.trigger()

    if (!isFormValid) {
      return
    }

    const formData = form.getValues()

    scheduleSave(formData)
  }
  const handleSubmit = (data: FieldsFormValues) => {
    
    const transformedData = data.fields.map((field, index) => ({
      ...field,
      id: index,
      customText: '',
      formId: field.formId,
      inserted: false,
      documentId: field.formId,
      recipient: {
        ...field.recipient,
        documentDeletedAt: null,
        documentId: 17,
        expiredAt: null,
        id: 17,
        readStatus: 'NOT_OPENED',
        rejectionReason: null,
        role: 'SIGNER',
        sendStatus: 'NOT_SENT',
        signedAt: null,
        signingOrder: 1,
        signingStatus: 'NOT_SIGNED',
        templateId: null,
        token: '2NNV00bWtwADO5rrC4vCE',
      },
      fieldMeta: field.fieldMeta,
      pageX: parseFloat(field.pageX.toString()),
      pageY: parseFloat(field.pageY.toString()),
      width: parseFloat(field.pageWidth.toString()),
      height: parseFloat(field.pageHeight.toString()),
    }))

    updateStepData(3, { ...data, fields: transformedData })
    nextStep()
  }

  // Effects
  useEffect(() => {
    const validRecipients = recipients.filter(
      (r) => r.role !== 'CC' && r.role !== 'ASSISTANT',
    )
    setSelectedSigner(
      validRecipients.find((r) => r.sendStatus !== 'SENT') ??
        validRecipients[0] ??
        null,
    )
  }, [recipients])

  useEffect(() => {
    if (selectedField) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseClick)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseClick)
    }
  }, [handleMouseClick, handleMouseMove, selectedField])

  // Field Validation
  const filterFieldsWithEmptyValues = useCallback(
    (fields: typeof localFields, fieldType: FieldType) =>
      fields.filter(
        (field) => field.type === fieldType && !field.fieldMeta?.values?.length,
      ),
    [],
  )
  const handleAdvancedSettings = () => {
    setShowAdvancedSettings((prev) => !prev)
  }
  const emptyCheckboxFields = useMemo(
    () => filterFieldsWithEmptyValues(localFields, FieldType.CHECKBOX),
    [localFields, filterFieldsWithEmptyValues],
  )
  const emptyRadioFields = useMemo(
    () => filterFieldsWithEmptyValues(localFields, FieldType.RADIO),
    [localFields, filterFieldsWithEmptyValues],
  )
  const emptySelectFields = useMemo(
    () => filterFieldsWithEmptyValues(localFields, FieldType.DROPDOWN),
    [localFields, filterFieldsWithEmptyValues],
  )

  const hasFieldErrors =
    emptyCheckboxFields.length > 0 ||
    emptyRadioFields.length > 0 ||
    emptySelectFields.length > 0
  console.log('localFields', localFields)

  // Render
  return (
    <>
      {showAdvancedSettings && currentField ? (
        <FieldAdvancedSettings
          title={`Advanced settings`}
          description={`Configure the ${
            FRIENDLY_FIELD_TYPE[currentField.type]
          } field`}
          field={currentField}
          fields={localFields}
          onAdvancedSettings={handleAdvancedSettings}
          //  isDocumentPdfLoaded={isDocumentPdfLoaded}
          //  onSave={(fieldState) => {
          //    handleSavedFieldSettings(fieldState);
          //    void handleAutoSave();
          //  }}
          onAutoSave={async (fieldState) => {
            handleSavedFieldSettings(fieldState)
            await handleAutoSave()
          }}
        />
      ) : (
        <>
          <DocumentFlowStepper currentStepIndex={3} />
          <DocumentFlowFormContainerHeader
            title='Add Fields'
            description='Add fields to your document for recipients to fill out.'
          />
          <DocumentFlowFormContainerContent>
            <div className='flex flex-col'>
              {selectedField && (
                <div
                  className={cn(
                    'text-muted-foreground dark:text-muted-background pointer-events-none fixed z-50 flex cursor-pointer flex-col items-center justify-center rounded-[2px] bg-white ring-2 transition duration-200 [container-type:size]',
                    selectedSignerStyles?.base,
                    {
                      '-rotate-6 scale-90 opacity-50 dark:bg-black/20':
                        !isFieldWithinBounds,
                      'dark:text-black/60': isFieldWithinBounds,
                    },
                  )}
                  style={{
                    top: coords.y,
                    left: coords.x,
                    height: fieldBounds.current.height,
                    width: fieldBounds.current.width,
                  }}
                >
                  <span className='text-[clamp(0.425rem,25cqw,0.825rem)]'>
                    {FRIENDLY_FIELD_TYPE[selectedField]}
                  </span>
                </div>
              )}
              {localFields.map((field, index) => {
                const recipientIndex = recipients.findIndex(
                  (r) => r.email === field.signerEmail,
                )
                console.log("Recipient Index from AddFieldsFormPartial: ", recipientIndex)
                const hasFieldError =
                  emptyCheckboxFields.some((f) => f.formId === field.formId) ||
                  emptyRadioFields.some((f) => f.formId === field.formId) ||
                  emptySelectFields.some((f) => f.formId === field.formId)

                return (
                  <FieldItem
                    key={field.formId}
                    recipientIndex={recipientIndex === -1 ? 0 : recipientIndex}
                    field={field}
                    minHeight={MIN_HEIGHT_PX}
                    minWidth={MIN_WIDTH_PX}
                    defaultHeight={DEFAULT_HEIGHT_PX}
                    defaultWidth={DEFAULT_WIDTH_PX}
                    passive={isFieldWithinBounds && !!selectedField}
                    onFocus={() => setLastActiveField(field)}
                    onBlur={() => setLastActiveField(null)}
                    onMouseEnter={() => setLastActiveField(field)}
                    onMouseLeave={() => setLastActiveField(null)}
                    onResize={(node) => handleFieldResize(node, index)}
                    onMove={(node) => handleFieldMove(node, index)}
                    onRemove={() => remove(index)}
                    onDuplicate={() =>
                      handleFieldCopy(null, { duplicate: true })
                    }
                    onDuplicateAllPages={() =>
                      handleFieldCopy(null, { duplicateAll: true })
                    }
                    onAdvancedSettings={() => {
                      setCurrentField(field)
                      setShowAdvancedSettings(true)
                    }}
                    hasErrors={hasFieldError}
                    active={activeFieldId === field.formId}
                    onFieldActivate={() => setActiveFieldId(field.formId)}
                    onFieldDeactivate={() => setActiveFieldId(null)}
                  />
                )
              })}
              {!hideRecipients && selectedSigner && (
                <RecipientSelector
                  selectedRecipient={selectedSigner}
                  onSelectedRecipientChange={setSelectedSigner}
                  recipients={recipients}
                  className='mt-2'
                />
              )}
              <Form {...form}>
                <div className='overflow-y-auto flex-1 px-2 -mx-2'>
                  <fieldset className='grid grid-cols-3 gap-4 my-2'>
                    {FIELD_TYPE_CONFIG.map(
                      ({ type, label, icon, className }) => (
                        <FieldButton
                          key={type}
                          type={type}
                          label={label}
                          icon={icon}
                          className={className}
                          isSelected={selectedField === type}
                          onClick={setSelectedField}
                        />
                      ),
                    )}
                  </fieldset>
                </div>
              </Form>
              {hasFieldErrors && (
                <Alert variant='destructive' className='mt-4'>
                  <AlertDescription>
                    Please fix all field errors before proceeding
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </DocumentFlowFormContainerContent>
          <DocumentFlowFormContainerFooter>

            <DocumentFlowFormContainerActions
              loading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting || hasFieldErrors}
              canGoBack={!isFirst}
              onGoBackClick={previousStep}
              onGoNextClick={form.handleSubmit(handleSubmit)}
            />
          </DocumentFlowFormContainerFooter>
        </>
      )}
    </>
  )
}

export default AddFieldsFormPartial
