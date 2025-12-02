// Define OrganisationMemberRole enum manually (instead of importing from @prisma/client)
export enum OrganisationMemberRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

// Simple message descriptor type (instead of @lingui/core)
export type MessageDescriptor = string

// Map with short labels
export const ORGANISATION_MEMBER_ROLE_MAP: Record<
  keyof typeof OrganisationMemberRole,
  MessageDescriptor
> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
}

// Map with extended labels
export const EXTENDED_ORGANISATION_MEMBER_ROLE_MAP: Record<
  keyof typeof OrganisationMemberRole,
  MessageDescriptor
> = {
  ADMIN: 'Organisation Admin',
  MANAGER: 'Organisation Manager',
  MEMBER: 'Organisation Member',
}
