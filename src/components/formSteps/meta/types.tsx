import type { MessageDescriptor } from '@lingui/core'
import { z } from 'zod'

// Instead of Prisma FieldType, define your own string union
export type FieldType =
  | 'SIGNATURE'
  | 'FREE_SIGNATURE'
  | 'INITIALS'
  | 'TEXT'
  | 'DATE'
  | 'EMAIL'
  | 'NAME'
  | 'NUMBER'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DROPDOWN'

export const ZDocumentFlowFormSchema = z.object({
  title: z.string().min(1),

  signers: z
    .array(
      z.object({
        formId: z.string().min(1),
        nativeId: z.number().optional(),
        email: z.string().min(1).email(),
        name: z.string(),
      }),
    )
    .refine((signers) => {
      const emails = signers.map((signer) => signer.email)
      return new Set(emails).size === emails.length
    }, 'Signers must have unique emails'),

  fields: z.array(
    z.object({
      formId: z.string().min(1),
      nativeId: z.number().optional(),
      type: z.string(), // could be z.enum([...]) for FieldType
      signerEmail: z.string().min(1).optional(),
      pageNumber: z.number().min(1),
      pageX: z.number().min(0),
      pageY: z.number().min(0),
      recipient: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      pageWidth: z.number().min(0),
      pageHeight: z.number().min(0),
      fieldMeta: z.any(),
    }),
  ),

  email: z.object({
    subject: z.string(),
    message: z.string(),
  }),
})

export type TDocumentFlowFormSchema = z.infer<typeof ZDocumentFlowFormSchema>

export const FRIENDLY_FIELD_TYPE: Record<FieldType, MessageDescriptor> = {
  SIGNATURE: 'Signature',
  FREE_SIGNATURE: 'Free Signature',
  INITIALS: 'Initials',
  TEXT: 'Text',
  DATE: 'Date',
  EMAIL: 'Email',
  NAME: 'Name',
  NUMBER: 'Number',
  RADIO: 'Radio',
  CHECKBOX: 'Checkbox',
  DROPDOWN: 'Select',
}

export interface DocumentFlowStep {
  title: string
  description: string
  stepIndex?: number
  
}
