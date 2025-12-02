// components/formSteps/AddSignersFormPartial.tsx
'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { HelpCircle, InfoIcon, Plus, Trash, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import { cn } from '../lib/ClsxConnct'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { useStep } from '../ui/stepper'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import axiosInstance from "@/config/apiConfig";
import { usePDFContext } from '@/context/PDFContext'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { DocumentSigningOrder, Recipient, RecipientRole } from '../schema/types'
import {
  DocumentFlowFormContainerActions,
  DocumentFlowFormContainerContent,
  DocumentFlowFormContainerFooter,
  DocumentFlowFormContainerHeader,
  DocumentFlowFormContainerStep,
  DocumentFlowStepper,
} from './DocumentFlowRoot'
import { DocumentReadOnlyFields } from './document-read-only-fields'
import { RecipientRoleSelect } from './field/recipient-role-select'
import axios from 'axios'
import { useEffect } from 'react'

// Helper function to generate random color
const generateRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const PREDEFINED_COLORS = [...new Set([
  '#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4', '#46F0F0', '#F032E6', '#BCF60C', '#FABEBE',
  '#008080', '#E6BEFF', '#9A6324', '#FFFAC8', '#800000', '#AAFFC3', '#808000', '#FFD8B1', '#000075', '#808080',
  '#FF4500', '#2E8B57', '#00CED1', '#BA55D3', '#CD5C5C', '#FF6347', '#FFA500', '#9ACD32', '#20B2AA', '#6495ED',
  '#7B68EE', '#4169E1', '#191970', '#8A2BE2', '#9932CC', '#C71585', '#DB7093', '#FF69B4', '#DC143C', '#B22222',
  '#A52A2A', '#D2691E', '#8B4513', '#DAA520', '#B8860B', '#FFD700', '#F0E68C', '#ADFF2F', '#32CD32', '#228B22',
  '#008000', '#006400', '#66CDAA', '#00FA9A', '#40E0D0', '#4682B4', '#00BFFF', '#1E90FF', '#87CEEB', '#5F9EA0',
  '#008B8B', '#2F4F4F', '#191970', '#483D8B', '#6A5ACD', '#7FFF00', '#7CFC00', '#8FBC8F', '#B0E0E6', '#BDB76B',
  '#CD853F', '#DEB887', '#F4A460', '#FF8C00', '#FF7F50', '#FF6347', '#FA8072', '#E9967A', '#FF1493', '#FF00FF',
  '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3', '#9932CC', '#4B0082', '#6B8E23', '#808000', '#556B2F',
  '#708090', '#778899', '#4682B4', '#5F9EA0', '#00CED1', '#20B2AA', '#008B8B', '#008080', '#2E8B57', '#006400'
])]


const getNextAvailableColor = (usedColors: string[]): string => {
  const availableColors = PREDEFINED_COLORS.filter(color => !usedColors.includes(color))
  
  if (availableColors.length === 0) {
    return PREDEFINED_COLORS[0]
  }
  
  return availableColors[0] 
}

const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Form schema with color validation
const signersSchema = z.object({
  signers: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      phone: z
        .string()
        .nullable() 
        .transform(val => val === null ? '' : val)
        .refine(
          (val) => val === '' || /^(\d{10})?$/.test(val), 
          'Phone must be a valid 10-digit US number (no country code)'
        )
        .optional(),
      role: z.enum(['SIGNER', 'VIEWER', 'APPROVER', 'CC', 'ASSISTANT']),
      signingOrder: z
        .number()
        .min(1, 'Signing order must be at least 1')
        .optional(),
      color: z
        .string()
        .refine(
          (color) => PREDEFINED_COLORS.includes(color),
          'Color must be selected from the available options'
        )
        .optional(),
    }),
  ),
  signingOrder: z.enum(['PARALLEL', 'SEQUENTIAL']),
  allowDictateNextSigner: z.boolean(),
}).refine(
  (data) => {
    // Check for duplicate colors
    const colors = data.signers
      .map(s => s.color)
      .filter((color): color is string => !!color)
    
    return colors.length === new Set(colors).size
  },
  {
    message: 'Each signer must have a unique color',
    path: ['signers'],
  }
)

type SignersFormValues = z.infer<typeof signersSchema>

const AddSignersFormPartial = ({
  setSelectedRecipients,
  recipients,
  documentId,
}: {
  setSelectedRecipients: (recipients: Recipient[]) => void
  recipients: Recipient[]
  documentId: string
}) => {
  const { nextStep, previousStep, isFirst, currentStep, totalSteps } = useStep()

  const { updateStepData, getStepData } = usePDFContext()
  const stepData = getStepData(2)
  const searchParams = useSearchParams()
  const clientName = searchParams.get('client_name')
  const clientEmail = searchParams.get('client_email')


  // Add console.log to debug
  console.log('Step 2 data:', stepData)
  console.log('Recipients:', recipients)
  // console.log('Initial signers:', initialSigners)

  const initialSigners =
    (recipients && recipients.length > 0
      ? recipients
      : stepData?.signers) ||
    (clientName && clientEmail
      ? [
          {
            name: clientName,
            email: clientEmail,
            role: 'SIGNER' as const,
            phone: '1234567890',
            signingOrder: 1,
            color: PREDEFINED_COLORS[0],
          },
        ]
      : [
          {
            name: '',
            email: '',
            role: 'SIGNER' as const,
            phone: '',
            signingOrder: 1,
            // color: generateRandomColor(),
            color: PREDEFINED_COLORS[0],
          },
        ])

        console.log('Initial signers:', initialSigners)
  const form = useForm<SignersFormValues>({
    resolver: zodResolver(signersSchema),
    defaultValues: {
      signers: initialSigners,
      signingOrder: 'PARALLEL',
      allowDictateNextSigner: false,
    },
  })

  // useEffect(() => {
  //   if (initialSigners && initialSigners.length > 0) {
  //     form.reset({
  //       signers: initialSigners,
  //       signingOrder: 'PARALLEL',
  //       allowDictateNextSigner: false,
  //     })
  //   }
  // }, [initialSigners, form.reset])

  const {
    fields: signers,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'signers',
  })

  const onSubmit = async (data: SignersFormValues) => {
    try {
      setSelectedRecipients(data.signers)
      const response = await axiosInstance.post(
        `/api/v1/files/create-recipient`,
        { documentId: documentId, recipients: data.signers },
      )
      
      if (response.data.success) {
        updateStepData(2, data)
        nextStep()
      } else {
        form.setError('signers', {
          type: 'manual',
          message: response.data.message || 'Failed to save recipients',
        })
      }
    } catch (error: any) {
      form.setError('signers', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to save recipients',
      })
    }
  }

  const onAddSigner = () => {
    // const existingColors = form.getValues('signers').map(s => s.color).filter(Boolean)
    // let newColor = generateRandomColor()

    const usedColors = form.getValues('signers').map(s => s.color).filter(Boolean)
    const newColor = getNextAvailableColor(usedColors)
    
    // Ensure unique color
    // while (existingColors.includes(newColor)) {
    //   newColor = generateRandomColor()
    // }
    
    append({
      name: '',
      email: '',
      role: 'SIGNER',
      signingOrder: signers.length + 1,
      color: newColor,
    })
  }

  const onRemoveSigner = (index: number) => {
    if (signers.length > 1) {
      remove(index)
    }
  }

  const handleRoleChange = useCallback(
    (index: number, role: RecipientRole) => {
      const currentSigners = form.getValues('signers')
      const signingOrder = form.getValues('signingOrder')

      // Handle parallel to sequential conversion for assistants
      if (
        role === RecipientRole.ASSISTANT &&
        signingOrder === DocumentSigningOrder.PARALLEL
      ) {
        form.setValue('signingOrder', DocumentSigningOrder.SEQUENTIAL)
        console.log('Assistant added as last signer')
        return
      }

      const updatedSigners = currentSigners.map((signer, idx) => ({
        ...signer,
        role: idx === index ? role : signer.role,
        signingOrder: idx + 1,
      }))
      setSelectedRecipients(updatedSigners)
      form.setValue('signers', updatedSigners)

      if (
        role === RecipientRole.ASSISTANT &&
        index === updatedSigners.length - 1
      ) {
        console.log('Assistant added as last signer')
      }
    },
    [form],
  )

  const watchedSigningOrder = form.watch('signingOrder')
  const isSequential = watchedSigningOrder === 'SEQUENTIAL'

  return (
    <>
      <DocumentFlowStepper currentStepIndex={2} />
      <DocumentFlowFormContainerHeader
        title='Add Signers'
        description='Add the people who will sign the document.'
      />
      <Form {...form}>
        <DocumentFlowFormContainerContent>
          <DocumentReadOnlyFields />
          <div className='space-y-6'>
            {isSequential && (
              <FormField
                control={form.control}
                name='allowDictateNextSigner'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='flex gap-2 items-center'>
                      <FormLabel className='text-gray-700'>
                        Allow signers to dictate next signer
                      </FormLabel>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className='w-4 h-4' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          When enabled, signers can choose who should sign next
                          in the sequence.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className='space-y-4'>
              {signers.map((signer, index) => (
                <div
                  key={signer.id}
                  className='grid grid-cols-12 gap-2 items-end p-3 rounded-md border border-background'
                >
                  {isSequential && (
                    <FormField
                      control={form.control}
                      name={`signers.${index}.signingOrder`}
                      render={({ field }) => (
                        <FormItem className='col-span-2'>
                          <FormLabel className='text-black'>Order</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={signers.length}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value)
                                field.onChange(isNaN(value) ? 1 : value)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`signers.${index}.phone`}
                    render={({ field }) => (
                      <FormItem
                        className={cn(
                          isSequential ? 'col-span-4' : 'col-span-6',
                        )}
                      >
                        <FormLabel className='text-black'>
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Mobile Number'
                            className='bg-white'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`signers.${index}.email`}
                    render={({ field }) => (
                      <FormItem
                        className={cn(
                          isSequential ? 'col-span-4' : 'col-span-6',
                        )}
                      >
                        <FormLabel className='text-black' required>
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Email'
                            className='bg-white'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`signers.${index}.name`}
                    render={({ field }) => (
                      <FormItem
                        className={cn(
                          isSequential ? 'col-span-3' : 'col-span-4',
                        )}
                      >
                        <FormLabel className='text-black' required>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Name'
                            className='bg-white'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name={`signers.${index}.color`}
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormLabel className='text-black'>Color</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type='color'
                              className='w-full h-10 bg-white rounded-md border-2 border-gray-300 cursor-pointer'
                              {...field}
                              onChange={(e) => {
                                const color = e.target.value.toUpperCase()
                                field.onChange(color)
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    control={form.control}
                    name={`signers.${index}.color`}
                    render={({ field }) => {
                      const usedColors = form.getValues('signers').map(s => s.color).filter(Boolean)
                      const availableColors = PREDEFINED_COLORS.filter(color => 
                        color === field.value || !usedColors.includes(color)
                      )
                      
                      return (
                        <FormItem className='col-span-4'>
                          <FormLabel className='text-black'>Color</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <select
                                className='px-2 pr-10 w-full h-10 bg-white rounded-md border-2 border-gray-300 appearance-none cursor-pointer'
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              >
                                {availableColors.map((color) => (
                                  <option 
                                    key={color} 
                                    value={color}
                                    style={{ 
                                      backgroundColor: color,
                                      color: getContrastColor(color), // Helper function for text contrast
                                      padding: '8px'
                                    }}
                                  >
                                    {color}
                                  </option>
                                ))}
                              </select>
                              
                              <div className='flex absolute right-8 top-1/2 items-center transform -translate-y-1/2'>
                                <div 
                                  className='w-6 h-6 rounded border border-gray-300 shadow-sm'
                                  style={{ backgroundColor: field.value }}
                                />
                              </div>
                              
                              <div className='absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                                <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                </svg>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                  <div className='flex col-span-1 gap-x-2 justify-center'>
                    {false && (
                      <FormField
                        control={form.control}
                        name={`signers.${index}.role`}
                        render={({ field }) => (
                          <FormItem
                            className={cn('space-y-0 mt-auto', {
                              'mb-6':
                                form.formState.errors.signers?.[index] &&
                                !form.formState.errors.signers[index]?.role,
                            })}
                          >
                            <FormControl>
                              <RecipientRoleSelect
                                {...field}
                                isAssistantEnabled={isSequential}
                                onValueChange={(value) =>
                                  handleRoleChange(index, value as RecipientRole)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <button
                      type='button'
                      className={cn(
                        'mt-auto inline-flex h-10 border border-background rounded-md px-3 items-center justify-center hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50',
                        {
                          'mb-6': form.formState.errors.signers?.[index],
                        },
                      )}
                      disabled={signers.length === 1}
                      onClick={() => onRemoveSigner(index)}
                    >
                      <Trash2 className='w-4 h-4 text-primary' />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {form.formState.errors.signers?.root && (
              <p className='text-sm text-red-500'>
                {form.formState.errors.signers.root.message}
              </p>
            )}

            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={onAddSigner}
            >
              <Plus className='mr-2 w-4 h-4' />
              Add Signer
            </Button>
          </div>
        </DocumentFlowFormContainerContent>

      <DocumentFlowFormContainerFooter>
        {/* <div className="space-y-4">
          <FormField
              control={form.control}
              name='signingOrder'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value === 'SEQUENTIAL'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'SEQUENTIAL' : 'PARALLEL')
                      }
                    />
                  </FormControl>
                  <FormLabel className='text-gray-700'>Enable signing order</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='allowDictateNextSigner'
              render={({ field: { value, ...field } }) => (
                <FormItem className='flex flex-row items-center mb-6 space-x-2 space-y-0'>
                  <FormControl>
                    <Checkbox
                      {...field}
                      id='allowDictateNextSigner'
                      checked={value}
                      onCheckedChange={field.onChange}
                      disabled={false}
                    />
                  </FormControl>

                  <div className='flex items-center'>
                    <FormLabel
                      htmlFor='allowDictateNextSigner'
                      className='text-sm leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    >
                      Allow signers to dictate next signer
                    </FormLabel>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='ml-1 cursor-help text-muted-foreground'>
                          <HelpCircle className='h-3.5 w-3.5' />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className='p-4 max-w-80'>
                        <p>
                          When enabled, signers can choose who should sign next
                          in the sequence instead of following the predefined
                          order.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </FormItem>
              )}
            />
        </div> */}
          <DocumentFlowFormContainerActions
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
            canGoBack={!isFirst}
            onGoBackClick={previousStep}
            onGoNextClick={form.handleSubmit(onSubmit)}
          />
        </DocumentFlowFormContainerFooter>
      </Form>
    </>
  )
}

export default AddSignersFormPartial