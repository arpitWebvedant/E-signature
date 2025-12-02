import { ZFieldMetaSchema } from '../meta/field-meta'

// Define custom FieldType as string literals
export type FieldType =
  | 'NUMBER'
  | 'TEXT'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'SIGNATURE'
  | 'INITIALS'
  | 'EMAIL'
  | 'DATE'
  | 'NAME'

// Define Field type based on JSON structure and FieldItem expectations
export type Field = {
  id: number
  secondaryId?: string
  documentId: number
  templateId?: number | null
  recipientId: number
  type: FieldType
  page?: number
  pageNumber?: number
  positionX?: string | number
  pageX?: number
  positionY?: string | number
  pageY?: number
  width?: string | number
  pageWidth?: number
  height?: string | number
  pageHeight?: number
  customText?: string
  inserted: boolean
  fieldMeta?: ZFieldMetaSchema | null
  recipient?: {
    id: number
    documentId: number
    templateId?: number | null
    email: string
    name?: string
    token?: string
    documentDeletedAt?: Date | null
    expired?: Date | null
    signedAt?: Date | null
    authOptions?: {
      accessAuth: string[]
      actionAuth: string[]
    }
    signingOrder?: number
    rejectionReason?: string | null
    role?: string
    readStatus?: string
    signingStatus?: string
    sendStatus?: string
  }
  signature?: {
    id: number
    created: string
    recipientId: number
    fieldId: number
    signatureImageAsBase64?: string | null
    typedSignature?: string | null
  } | null
  signerEmail?: string
  nativeId?: number
}

// Fields with optional settings in fieldMeta
export const ADVANCED_FIELD_TYPES_WITH_OPTIONAL_SETTING: FieldType[] = [
  'NUMBER',
  'TEXT',
  'DROPDOWN',
  'RADIO',
  'CHECKBOX',
]

/**
 * Whether a field is required to be inserted.
 */
export const isRequiredField = (field: Field) => {
  // All fields without optional metadata are assumed to be required
  if (!ADVANCED_FIELD_TYPES_WITH_OPTIONAL_SETTING.includes(field.type)) {
    return true
  }

  // If no fieldMeta, assume the field is optional
  if (!field.fieldMeta) {
    return false
  }

  const parsedData = ZFieldMetaSchema.safeParse(field.fieldMeta)

  // If parsing fails, assume the field is optional
  if (!parsedData.success) {
    return false
  }

  return parsedData.data?.required === true
}

/**
 * Whether the provided field is required and not inserted.
 */
export const isFieldUnsignedAndRequired = (field: Field) =>
  isRequiredField(field) && !field.inserted

/**
 * Whether the provided fields contain a field that is required to be inserted.
 */
export const fieldsContainUnsignedRequiredField = (fields: Field[]) =>
  fields.some(isFieldUnsignedAndRequired)
