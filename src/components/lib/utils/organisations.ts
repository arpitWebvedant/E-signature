import { DEFAULT_DOCUMENT_EMAIL_SETTINGS } from '@/components/schema/document-email'
import {
  LOWEST_ORGANISATION_ROLE,
  ORGANISATION_MEMBER_ROLE_HIERARCHY,
  ORGANISATION_MEMBER_ROLE_PERMISSIONS_MAP,
} from '@/components/schema/organisations'
import type { ORGANISATION_MEMBER_ROLE_MAP } from '@/components/schema/organisations-translations'
import { DEFAULT_DOCUMENT_DATE_FORMAT } from '@/components/ui/date-formats'

/**
 * Replace Prisma's enums and types with local definitions
 */
export enum DocumentVisibility {
  EVERYONE = 'EVERYONE',
  MEMBERS_ONLY = 'MEMBERS_ONLY',
}

export type Organisation = {
  id: string
  type: 'PERSONAL' | 'TEAM' | 'ENTERPRISE'
}

export type OrganisationGroup = {
  type: string
  organisationRole: OrganisationMemberRole
}

export type OrganisationMemberRole = keyof typeof ORGANISATION_MEMBER_ROLE_MAP

export type OrganisationGlobalSettings = {
  id: string
  organisation: string
  documentVisibility: DocumentVisibility
  documentLanguage: string
  documentTimezone: string | null
  documentDateFormat: string

  includeSenderDetails: boolean
  includeSigningCertificate: boolean
  includeAuditLog: boolean

  typedSignatureEnabled: boolean
  uploadSignatureEnabled: boolean
  drawSignatureEnabled: boolean

  brandingEnabled: boolean
  brandingLogo: string
  brandingUrl: string
  brandingCompanyDetails: string

  emailId: string | null
  emailReplyTo: string | null
  emailDocumentSettings: typeof DEFAULT_DOCUMENT_EMAIL_SETTINGS
}

/**
 * Mimic Prisma's OrganisationWhereInput type
 */
export type OrganisationWhereInput = {
  id?: string
  members?: {
    some: {
      userId: number
      organisationGroupMembers?: {
        some: {
          group: {
            organisationRole:
              | OrganisationMemberRole
              | { in: OrganisationMemberRole[] }
          }
        }
      }
    }
  }
}

export const isPersonalLayout = (
  organisations: Pick<Organisation, 'type'>[],
) => {
  return organisations.length === 1 && organisations[0].type === 'PERSONAL'
}

/**
 * Determines whether a team member can execute a given action.
 */
export const canExecuteOrganisationAction = (
  action: keyof typeof ORGANISATION_MEMBER_ROLE_PERMISSIONS_MAP,
  role: keyof typeof ORGANISATION_MEMBER_ROLE_MAP,
) => {
  return ORGANISATION_MEMBER_ROLE_PERMISSIONS_MAP[action].some(
    (i) => i === role,
  )
}

/**
 * Compares roles to check modification permissions.
 */
export const isOrganisationRoleWithinUserHierarchy = (
  currentUserRole: keyof typeof ORGANISATION_MEMBER_ROLE_MAP,
  roleToCheck: keyof typeof ORGANISATION_MEMBER_ROLE_MAP,
) => {
  return ORGANISATION_MEMBER_ROLE_HIERARCHY[currentUserRole].some(
    (i) => i === roleToCheck,
  )
}

export const getHighestOrganisationRoleInGroup = (
  groups: Pick<OrganisationGroup, 'type' | 'organisationRole'>[],
): OrganisationMemberRole => {
  let highestOrganisationRole: OrganisationMemberRole = LOWEST_ORGANISATION_ROLE

  groups.forEach((group) => {
    const currentRolePriority =
      ORGANISATION_MEMBER_ROLE_HIERARCHY[group.organisationRole].length
    const highestOrganisationRolePriority =
      ORGANISATION_MEMBER_ROLE_HIERARCHY[highestOrganisationRole].length

    if (currentRolePriority > highestOrganisationRolePriority) {
      highestOrganisationRole = group.organisationRole
    }
  })

  return highestOrganisationRole
}

type BuildOrganisationWhereQueryOptions = {
  organisationId: string | undefined
  userId: number
  roles?: OrganisationMemberRole[]
}

export const buildOrganisationWhereQuery = ({
  organisationId,
  userId,
  roles,
}: BuildOrganisationWhereQueryOptions): OrganisationWhereInput => {
  if (!roles) {
    return {
      id: organisationId,
      members: {
        some: {
          userId,
        },
      },
    }
  }

  return {
    id: organisationId,
    members: {
      some: {
        userId,
        organisationGroupMembers: {
          some: {
            group: {
              organisationRole: { in: roles },
            },
          },
        },
      },
    },
  }
}

export const generateDefaultOrganisationSettings = (): Omit<
  OrganisationGlobalSettings,
  'id' | 'organisation'
> => {
  return {
    documentVisibility: DocumentVisibility.EVERYONE,
    documentLanguage: 'en',
    documentTimezone: null, // Null means local timezone.
    documentDateFormat: DEFAULT_DOCUMENT_DATE_FORMAT,

    includeSenderDetails: true,
    includeSigningCertificate: true,
    includeAuditLog: false,

    typedSignatureEnabled: true,
    uploadSignatureEnabled: true,
    drawSignatureEnabled: true,

    brandingEnabled: false,
    brandingLogo: '',
    brandingUrl: '',
    brandingCompanyDetails: '',

    emailId: null,
    emailReplyTo: null,
    emailDocumentSettings: DEFAULT_DOCUMENT_EMAIL_SETTINGS,
  }
}
