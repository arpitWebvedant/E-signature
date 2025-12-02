import type { ColumnType } from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>
export type Timestamp = ColumnType<Date, Date | string, Date | string>

export const IdentityProvider = {
  DOCUMENSO: 'DOCUMENSO',
  GOOGLE: 'GOOGLE',
  OIDC: 'OIDC',
} as const
export type IdentityProvider =
  (typeof IdentityProvider)[keyof typeof IdentityProvider]
export const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const
export type Role = (typeof Role)[keyof typeof Role]
export const UserSecurityAuditLogType = {
  ACCOUNT_PROFILE_UPDATE: 'ACCOUNT_PROFILE_UPDATE',
  ACCOUNT_SSO_LINK: 'ACCOUNT_SSO_LINK',
  AUTH_2FA_DISABLE: 'AUTH_2FA_DISABLE',
  AUTH_2FA_ENABLE: 'AUTH_2FA_ENABLE',
  PASSKEY_CREATED: 'PASSKEY_CREATED',
  PASSKEY_DELETED: 'PASSKEY_DELETED',
  PASSKEY_UPDATED: 'PASSKEY_UPDATED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  PASSWORD_UPDATE: 'PASSWORD_UPDATE',
  SESSION_REVOKED: 'SESSION_REVOKED',
  SIGN_OUT: 'SIGN_OUT',
  SIGN_IN: 'SIGN_IN',
  SIGN_IN_FAIL: 'SIGN_IN_FAIL',
  SIGN_IN_2FA_FAIL: 'SIGN_IN_2FA_FAIL',
  SIGN_IN_PASSKEY_FAIL: 'SIGN_IN_PASSKEY_FAIL',
} as const
export type UserSecurityAuditLogType =
  (typeof UserSecurityAuditLogType)[keyof typeof UserSecurityAuditLogType]
export const WebhookTriggerEvents = {
  DOCUMENT_CREATED: 'DOCUMENT_CREATED',
  DOCUMENT_SENT: 'DOCUMENT_SENT',
  DOCUMENT_OPENED: 'DOCUMENT_OPENED',
  DOCUMENT_SIGNED: 'DOCUMENT_SIGNED',
  DOCUMENT_COMPLETED: 'DOCUMENT_COMPLETED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  DOCUMENT_CANCELLED: 'DOCUMENT_CANCELLED',
} as const
export type WebhookTriggerEvents =
  (typeof WebhookTriggerEvents)[keyof typeof WebhookTriggerEvents]
export const WebhookCallStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const
export type WebhookCallStatus =
  (typeof WebhookCallStatus)[keyof typeof WebhookCallStatus]
export const ApiTokenAlgorithm = {
  SHA512: 'SHA512',
} as const
export type ApiTokenAlgorithm =
  (typeof ApiTokenAlgorithm)[keyof typeof ApiTokenAlgorithm]
export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  INACTIVE: 'INACTIVE',
} as const
export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]
export const DocumentStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const
export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus]
export const DocumentSource = {
  DOCUMENT: 'DOCUMENT',
  TEMPLATE: 'TEMPLATE',
  TEMPLATE_DIRECT_LINK: 'TEMPLATE_DIRECT_LINK',
} as const
export type DocumentSource =
  (typeof DocumentSource)[keyof typeof DocumentSource]
export const DocumentVisibility = {
  EVERYONE: 'EVERYONE',
  MANAGER_AND_ABOVE: 'MANAGER_AND_ABOVE',
  ADMIN: 'ADMIN',
} as const
export type DocumentVisibility =
  (typeof DocumentVisibility)[keyof typeof DocumentVisibility]
export const FolderType = {
  DOCUMENT: 'DOCUMENT',
  TEMPLATE: 'TEMPLATE',
} as const
export type FolderType = (typeof FolderType)[keyof typeof FolderType]
export const DocumentDataType = {
  S3_PATH: 'S3_PATH',
  BYTES: 'BYTES',
  BYTES_64: 'BYTES_64',
} as const
export type DocumentDataType =
  (typeof DocumentDataType)[keyof typeof DocumentDataType]
export const DocumentSigningOrder = {
  PARALLEL: 'PARALLEL',
  SEQUENTIAL: 'SEQUENTIAL',
} as const
export type DocumentSigningOrder =
  (typeof DocumentSigningOrder)[keyof typeof DocumentSigningOrder]
export const DocumentDistributionMethod = {
  EMAIL: 'EMAIL',
  NONE: 'NONE',
} as const
export type DocumentDistributionMethod =
  (typeof DocumentDistributionMethod)[keyof typeof DocumentDistributionMethod]
export const ReadStatus = {
  NOT_OPENED: 'NOT_OPENED',
  OPENED: 'OPENED',
} as const
export type ReadStatus = (typeof ReadStatus)[keyof typeof ReadStatus]
export const SendStatus = {
  NOT_SENT: 'NOT_SENT',
  SENT: 'SENT',
} as const
export type SendStatus = (typeof SendStatus)[keyof typeof SendStatus]
export const SigningStatus = {
  NOT_SIGNED: 'NOT_SIGNED',
  SIGNED: 'SIGNED',
  REJECTED: 'REJECTED',
} as const
export type SigningStatus = (typeof SigningStatus)[keyof typeof SigningStatus]
export const RecipientRole = {
  CC: 'CC',
  SIGNER: 'SIGNER',
  VIEWER: 'VIEWER',
  APPROVER: 'APPROVER',
  ASSISTANT: 'ASSISTANT',
} as const
export type RecipientRole = (typeof RecipientRole)[keyof typeof RecipientRole]
export const FieldType = {
  SIGNATURE: 'SIGNATURE',
  FREE_SIGNATURE: 'FREE_SIGNATURE',
  INITIALS: 'INITIALS',
  NAME: 'NAME',
  EMAIL: 'EMAIL',
  DATE: 'DATE',
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  RADIO: 'RADIO',
  CHECKBOX: 'CHECKBOX',
  DROPDOWN: 'DROPDOWN',
} as const
export type FieldType = (typeof FieldType)[keyof typeof FieldType]
export const OrganisationType = {
  PERSONAL: 'PERSONAL',
  ORGANISATION: 'ORGANISATION',
} as const
export type OrganisationType =
  (typeof OrganisationType)[keyof typeof OrganisationType]
export const OrganisationGroupType = {
  INTERNAL_ORGANISATION: 'INTERNAL_ORGANISATION',
  INTERNAL_TEAM: 'INTERNAL_TEAM',
  CUSTOM: 'CUSTOM',
} as const
export type OrganisationGroupType =
  (typeof OrganisationGroupType)[keyof typeof OrganisationGroupType]
export const OrganisationMemberRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
} as const
export type OrganisationMemberRole =
  (typeof OrganisationMemberRole)[keyof typeof OrganisationMemberRole]
export const TeamMemberRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
} as const
export type TeamMemberRole =
  (typeof TeamMemberRole)[keyof typeof TeamMemberRole]
export const OrganisationMemberInviteStatus = {
  ACCEPTED: 'ACCEPTED',
  PENDING: 'PENDING',
  DECLINED: 'DECLINED',
} as const
export type OrganisationMemberInviteStatus =
  (typeof OrganisationMemberInviteStatus)[keyof typeof OrganisationMemberInviteStatus]
export const TemplateType = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const
export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType]
export const BackgroundJobStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const
export type BackgroundJobStatus =
  (typeof BackgroundJobStatus)[keyof typeof BackgroundJobStatus]
export const BackgroundJobTaskStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const
export type BackgroundJobTaskStatus =
  (typeof BackgroundJobTaskStatus)[keyof typeof BackgroundJobTaskStatus]
export const EmailDomainStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
} as const
export type EmailDomainStatus =
  (typeof EmailDomainStatus)[keyof typeof EmailDomainStatus]
export type Account = {
  id: string
  userId: number
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  created_at: number | null
  ext_expires_in: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  password: string | null
}
export type AnonymousVerificationToken = {
  id: string
  token: string
  expiresAt: Timestamp
  createdAt: Generated<Timestamp>
}
export type ApiToken = {
  id: Generated<number>
  name: string
  token: string
  algorithm: Generated<ApiTokenAlgorithm>
  expires: Timestamp | null
  createdAt: Generated<Timestamp>
  userId: number | null
  teamId: number
}
export type AvatarImage = {
  id: string
  bytes: string
}


export type Document = {
  id: Generated<number>
  file?: string

  documentBytes?: ArrayBuffer
  recipients? : Array<Recipient>
  fileType?: string
  /**
   * @zod.string.describe("The token for viewing the document using the QR code on the certificate.")
   */
  qrToken: string | null
  /**
   * @zod.string.describe("A custom external ID you can use to identify the document.")
   */
  externalId: string | null
  /**
   * @zod.number.describe("The ID of the user that created this document.")
   */
  userId: number
  teamId: number
  /**
   * [DocumentAuthOptions] @zod.custom.use(ZDocumentAuthOptionsSchema)
   */
  authOptions: any | null
  /**
   * [DocumentFormValues] @zod.custom.use(ZDocumentFormValuesSchema)
   */
  formValues: any | null
  visibility: Generated<DocumentVisibility>
  title: string
  status: Generated<DocumentStatus>
  documentDataId: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  completedAt: Timestamp | null
  deletedAt: Timestamp | null
  templateId: number | null
  source: DocumentSource
  useLegacyFieldInsertion: Generated<boolean>
  folderId: string | null
}
export type DocumentAuditLog = {
  id: string
  documentId: number
  createdAt: Generated<Timestamp>
  type: string
  data: any
  name: string | null
  email: string | null
  userId: number | null
  userAgent: string | null
  ipAddress: string | null
}
export type DocumentData = {
  id: string
  type: DocumentDataType
  data: string
  initialData: string
}
export type DocumentMeta = {
  id: string
  subject: string | null
  message: string | null
  timezone: Generated<string | null>
  password: string | null
  dateFormat: Generated<string | null>
  documentId: number
  redirectUrl: string | null
  signingOrder: Generated<DocumentSigningOrder>
  allowDictateNextSigner: Generated<boolean>
  typedSignatureEnabled: Generated<boolean>
  uploadSignatureEnabled: Generated<boolean>
  drawSignatureEnabled: Generated<boolean>
  language: Generated<string>
  distributionMethod: Generated<DocumentDistributionMethod>
  /**
   * [DocumentEmailSettings] @zod.custom.use(ZDocumentEmailSettingsSchema)
   */
  emailSettings: any | null
  emailReplyTo: string | null
  emailId: string | null
}
export type DocumentShareLink = {
  id: Generated<number>
  email: string
  slug: string
  documentId: number
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
}
export type EmailDomain = {
  id: string
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  status: Generated<EmailDomainStatus>
  selector: string
  domain: string
  publicKey: string
  privateKey: string
  organisationId: string
}
export type Field = {
  id: Generated<number>
  secondaryId: string
  documentId: number | null
  templateId: number | null
  recipientId: number
  type: FieldType
  /**
   * @zod.number.describe("The page number of the field on the document. Starts from 1.")
   */
  page: number
  pageX: Generated<string>
  pageY: Generated<string>
  pageHeight: Generated<string>
  pageWidth: Generated<string>
  positionX: Generated<string>
  positionY: Generated<string>
  width: Generated<string>
  height: Generated<string>
  customText: string
  inserted: boolean
  /**
   * [FieldMeta] @zod.custom.use(ZFieldMetaNotOptionalSchema)
   */
  fieldMeta: null
}
export type Folder = {
  id: string
  name: string
  userId: number
  teamId: number
  pinned: Generated<boolean>
  parentId: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  visibility: Generated<DocumentVisibility>
  type: FolderType
}
export type Organisation = {
  id: string
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  type: OrganisationType
  name: string
  url: string
  avatarImageId: string | null
  customerId: string | null
  organisationClaimId: string
  ownerUserId: number
  organisationGlobalSettingsId: string
}
export type OrganisationClaim = {
  id: string
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  originalSubscriptionClaimId: string | null
  teamCount: number
  memberCount: number
  /**
   * [ClaimFlags] @zod.custom.use(ZClaimFlagsSchema)
   */
  flags: any
}
export type OrganisationEmail = {
  id: string
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  email: string
  emailName: string
  emailDomainId: string
  organisationId: string
}
export type OrganisationGlobalSettings = {
  id: string
  documentVisibility: Generated<DocumentVisibility>
  documentLanguage: Generated<string>
  includeSenderDetails: Generated<boolean>
  includeSigningCertificate: Generated<boolean>
  includeAuditLog: Generated<boolean>
  documentTimezone: string | null
  documentDateFormat: Generated<string>
  typedSignatureEnabled: Generated<boolean>
  uploadSignatureEnabled: Generated<boolean>
  drawSignatureEnabled: Generated<boolean>
  emailId: string | null
  emailReplyTo: string | null
  /**
   * [DocumentEmailSettings] @zod.custom.use(ZDocumentEmailSettingsSchema)
   */
  emailDocumentSettings: any
  brandingEnabled: Generated<boolean>
  brandingLogo: Generated<string>
  brandingUrl: Generated<string>
  brandingCompanyDetails: Generated<string>
}
export type OrganisationGroup = {
  id: string
  name: string | null
  type: OrganisationGroupType
  organisationRole: OrganisationMemberRole
  organisationId: string
}
export type OrganisationGroupMember = {
  id: string
  groupId: string
  organisationMemberId: string
}
export type OrganisationMember = {
  id: string
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  userId: number
  organisationId: string
}
export type OrganisationMemberInvite = {
  id: string
  createdAt: Generated<Timestamp>
  email: string
  token: string
  status: Generated<OrganisationMemberInviteStatus>
  organisationId: string
  organisationRole: OrganisationMemberRole
}
export type Passkey = {
  id: string
  userId: number
  name: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  lastUsedAt: Timestamp | null
  credentialId: Buffer
  credentialPublicKey: Buffer
  counter: string
  credentialDeviceType: string
  credentialBackedUp: boolean
  transports: string[]
}
export type PasswordResetToken = {
  id: Generated<number>
  token: string
  createdAt: Generated<Timestamp>
  expiry: Timestamp
  userId: number
}
export type Recipient = {
  id: Generated<number>
  documentId: number | null
  templateId: number | null
  email: string
  name: Generated<string>
  token: string
  documentDeletedAt: Timestamp | null
  expired: Timestamp | null
  signedAt: Timestamp | null
  /**
   * [RecipientAuthOptions] @zod.custom.use(ZRecipientAuthOptionsSchema)
   */
  authOptions: any | null
  /**
   * @zod.number.describe("The order in which the recipient should sign the document. Only works if the document is set to sequential signing.")
   */
  signingOrder: number | null
  color: string | null
  rejectionReason: string | null
  role: Generated<RecipientRole>
  readStatus: Generated<ReadStatus>
  signingStatus: Generated<SigningStatus>
  sendStatus: Generated<SendStatus>
}
export type Session = {
  id: string
  sessionToken: string
  userId: number
  ipAddress: string | null
  userAgent: string | null
  expiresAt: Timestamp
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
}
export type Signature = {
  id: Generated<number>
  created: Generated<Timestamp>
  recipientId: number
  fieldId: number
  signatureImageAsBase64: string | null
  typedSignature: string | null
}
export type SiteSettings = {
  id: string
  enabled: Generated<boolean>
  data: any
  lastModifiedByUserId: number | null
  lastModifiedAt: Generated<Timestamp>
}
export type Subscription = {
  id: Generated<number>
  status: Generated<SubscriptionStatus>
  planId: string
  priceId: string
  periodEnd: Timestamp | null
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  cancelAtPeriodEnd: Generated<boolean>
  customerId: string
  organisationId: string
}
export type SubscriptionClaim = {
  id: string
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  name: string
  locked: Generated<boolean>
  teamCount: number
  memberCount: number
  /**
   * [ClaimFlags] @zod.custom.use(ZClaimFlagsSchema)
   */
  flags: any
}
export type Team = {
  id: Generated<number>
  name: string
  url: string
  createdAt: Generated<Timestamp>
  avatarImageId: string | null
  organisationId: string
  teamGlobalSettingsId: string
}
export type TeamEmail = {
  teamId: number
  createdAt: Generated<Timestamp>
  name: string
  email: string
}
export type TeamEmailVerification = {
  teamId: number
  name: string
  email: string
  token: string
  completed: Generated<boolean>
  expiresAt: Timestamp
  createdAt: Generated<Timestamp>
}
export type TeamGlobalSettings = {
  id: string
  documentVisibility: DocumentVisibility | null
  documentLanguage: string | null
  documentTimezone: string | null
  documentDateFormat: string | null
  includeSenderDetails: boolean | null
  includeSigningCertificate: boolean | null
  includeAuditLog: boolean | null
  typedSignatureEnabled: boolean | null
  uploadSignatureEnabled: boolean | null
  drawSignatureEnabled: boolean | null
  emailId: string | null
  emailReplyTo: string | null
  /**
   * [DocumentEmailSettingsNullable] @zod.custom.use(ZDocumentEmailSettingsSchema)
   */
  emailDocumentSettings: any | null
  brandingEnabled: boolean | null
  brandingLogo: string | null
  brandingUrl: string | null
  brandingCompanyDetails: string | null
}
export type TeamGroup = {
  id: string
  organisationGroupId: string
  teamRole: TeamMemberRole
  teamId: number
}
export type TeamProfile = {
  id: string
  enabled: Generated<boolean>
  teamId: number
  bio: string | null
}
export type Template = {
  id: Generated<number>
  externalId: string | null
  type: Generated<TemplateType>
  title: string
  visibility: Generated<DocumentVisibility>
  /**
   * [DocumentAuthOptions] @zod.custom.use(ZDocumentAuthOptionsSchema)
   */
  authOptions: any | null
  templateDocumentDataId: string
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  publicTitle: Generated<string>
  publicDescription: Generated<string>
  useLegacyFieldInsertion: Generated<boolean>
  userId: number
  teamId: number
  folderId: string | null
}
export type TemplateDirectLink = {
  id: string
  templateId: number
  token: string
  createdAt: Generated<Timestamp>
  enabled: boolean
  directTemplateRecipientId: number
}
export type TemplateMeta = {
  id: string
  subject: string | null
  message: string | null
  timezone: Generated<string | null>
  password: string | null
  dateFormat: Generated<string | null>
  signingOrder: Generated<DocumentSigningOrder | null>
  allowDictateNextSigner: Generated<boolean>
  distributionMethod: Generated<DocumentDistributionMethod>
  typedSignatureEnabled: Generated<boolean>
  uploadSignatureEnabled: Generated<boolean>
  drawSignatureEnabled: Generated<boolean>
  templateId: number
  redirectUrl: string | null
  language: Generated<string>
  /**
   * [DocumentEmailSettings] @zod.custom.use(ZDocumentEmailSettingsSchema)
   */
  emailSettings: any | null
  emailReplyTo: string | null
  emailId: string | null
}
export type User = {
  id: Generated<number>
  name: string | null
  email: string
  emailVerified: Timestamp | null
  password: string | null
  source: string | null
  signature: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  lastSignedIn: Generated<Timestamp>
  roles: Generated<Role[]>
  identityProvider: Generated<IdentityProvider>
  avatarImageId: string | null
  disabled: Generated<boolean>
  twoFactorSecret: string | null
  twoFactorEnabled: Generated<boolean>
  twoFactorBackupCodes: string | null
}
export type UserSecurityAuditLog = {
  id: Generated<number>
  userId: number
  createdAt: Generated<Timestamp>
  type: UserSecurityAuditLogType
  userAgent: string | null
  ipAddress: string | null
}
export type VerificationToken = {
  id: Generated<number>
  secondaryId: string
  identifier: string
  token: string
  completed: Generated<boolean>
  expires: Timestamp
  createdAt: Generated<Timestamp>
  userId: number
}
export type Webhook = {
  id: string
  webhookUrl: string
  eventTriggers: WebhookTriggerEvents[]
  secret: string | null
  enabled: Generated<boolean>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  userId: number
  teamId: number
}
export type WebhookCall = {
  id: string
  status: WebhookCallStatus
  url: string
  event: WebhookTriggerEvents
  requestBody: any
  responseCode: number
  responseHeaders: any | null
  responseBody: any | null
  createdAt: Generated<Timestamp>
  webhookId: string
}

export type UserData = {
  fullName?: string
  email?: string
  signature?: string
}
export interface GlobalUserData {
  _id: string
  email: string
  fullName: string
  name?: string
  profilePicture?: string
  centralizedUserId?: string
  isCentralizedAuth?: boolean
  signature?: string
  role?: string
}
export type GlobalUser = {
  data: {
    _id: string
    email: string
    fullName: string
    user: GlobalUserData
    [key: string]: string | number | boolean | null | GlobalUserData
  }
  token: string
}

export type GlobalContextType = {
  user?: GlobalUser
}