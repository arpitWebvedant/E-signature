/**
 * Document status types
 */
export enum DocumentStatus {
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
}

/**
 * Document distribution methods
 */
export enum DocumentDistributionMethod {
  EMAIL = 'EMAIL',
  NONE = 'NONE',
}

/**
 * Document signature types
 */
export enum DocumentSignatureType {
  DRAW = 'DRAW',
  TYPE = 'TYPE',
  UPLOAD = 'UPLOAD',
}

export const DOCUMENT_STATUS: {
  [status in DocumentStatus]: { description: string }
} = {
  [DocumentStatus.COMPLETED]: {
    description: 'Completed',
  },
  [DocumentStatus.REJECTED]: {
    description: 'Rejected',
  },
  [DocumentStatus.DRAFT]: {
    description: 'Draft',
  },
  [DocumentStatus.PENDING]: {
    description: 'Pending',
  },
}

type DocumentDistributionMethodTypeData = {
  value: DocumentDistributionMethod
  description: string
}

export const DOCUMENT_DISTRIBUTION_METHODS: Record<
  string,
  DocumentDistributionMethodTypeData
> = {
  [DocumentDistributionMethod.EMAIL]: {
    value: DocumentDistributionMethod.EMAIL,
    description: 'Email',
  },
  [DocumentDistributionMethod.NONE]: {
    value: DocumentDistributionMethod.NONE,
    description: 'None',
  },
}



export const DOCUMENT_SIGNATURE_TYPES = {
  [DocumentSignatureType.DRAW]: {
    label: 'Draw',
    value: DocumentSignatureType.DRAW,
  },
  [DocumentSignatureType.TYPE]: {
    label: 'Type',
    value: DocumentSignatureType.TYPE,
  },
  [DocumentSignatureType.UPLOAD]: {
    label: 'Upload',
    value: DocumentSignatureType.UPLOAD,
  },
}
