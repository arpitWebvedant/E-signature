import { DocumentStatus } from '@prisma/client'

export enum OrganisationType {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM',
}

export const ExtendedDocumentStatus = {
  ...DocumentStatus,
  INBOX: 'INBOX',
  ALL: 'ALL',
} as const

export type ExtendedDocumentStatus = keyof typeof ExtendedDocumentStatus

export const DocumentStatusLabels: Record<ExtendedDocumentStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  INBOX: 'Inbox',
  ALL: 'All Documents',
}
