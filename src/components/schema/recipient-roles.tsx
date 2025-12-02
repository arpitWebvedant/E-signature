import { RecipientRole } from '@prisma/client'

export const RECIPIENT_ROLES_DESCRIPTION = {
  [RecipientRole.APPROVER]: {
    actionVerb: {
      message: `Approve`,
      context: `Recipient role action verb`,
    },
    actioned: {
      message: `Approved`,
      context: `Recipient role actioned`,
    },
    progressiveVerb: {
      message: `Approving`,
      context: `Recipient role progressive verb`,
    },
    roleName: {
      message: `Approver`,
      context: `Recipient role name`,
    },
    roleNamePlural: {
      message: `Approvers`,
      context: `Recipient role plural name`,
    },
  },
  [RecipientRole.CC]: {
    actionVerb: {
      message: `CC`,
      context: `Recipient role action verb`,
    },
    actioned: {
      message: `CC'd`,
      context: `Recipient role actioned`,
    },
    progressiveVerb: {
      message: `CC`,
      context: `Recipient role progressive verb`,
    },
    roleName: {
      message: `Cc`,
      context: `Recipient role name`,
    },
    roleNamePlural: {
      message: `Ccers`,
      context: `Recipient role plural name`,
    },
  },
  [RecipientRole.SIGNER]: {
    actionVerb: {
      message: `Sign`,
      context: `Recipient role action verb`,
    },
    actioned: {
      message: `Signed`,
      context: `Recipient role actioned`,
    },
    progressiveVerb: {
      message: `Signing`,
      context: `Recipient role progressive verb`,
    },
    roleName: {
      message: `Signer`,
      context: `Recipient role name`,
    },
    roleNamePlural: {
      message: `Signers`,
      context: `Recipient role plural name`,
    },
  },
  [RecipientRole.VIEWER]: {
    actionVerb: {
      message: `View`,
      context: `Recipient role action verb`,
    },
    actioned: {
      message: `Viewed`,
      context: `Recipient role actioned`,
    },
    progressiveVerb: {
      message: `Viewing`,
      context: `Recipient role progressive verb`,
    },
    roleName: {
      message: `Viewer`,
      context: `Recipient role name`,
    },
    roleNamePlural: {
      message: `Viewers`,
      context: `Recipient role plural name`,
    },
  },
  [RecipientRole.ASSISTANT]: {
    actionVerb: {
      message: `Assist`,
      context: `Recipient role action verb`,
    },
    actioned: {
      message: `Assisted`,
      context: `Recipient role actioned`,
    },
    progressiveVerb: {
      message: `Assisting`,
      context: `Recipient role progressive verb`,
    },
    roleName: {
      message: `Assistant`,
      context: `Recipient role name`,
    },
    roleNamePlural: {
      message: `Assistants`,
      context: `Recipient role plural name`,
    },
  },
} satisfies Record<keyof typeof RecipientRole, any>

export const RECIPIENT_ROLE_TO_DISPLAY_TYPE = {
  [RecipientRole.SIGNER]: `SIGNING_REQUEST`,
  [RecipientRole.VIEWER]: `VIEW_REQUEST`,
  [RecipientRole.APPROVER]: `APPROVE_REQUEST`,
} as const

export const RECIPIENT_ROLE_TO_EMAIL_TYPE = {
  [RecipientRole.SIGNER]: `SIGNING_REQUEST`,
  [RecipientRole.VIEWER]: `VIEW_REQUEST`,
  [RecipientRole.APPROVER]: `APPROVE_REQUEST`,
  [RecipientRole.ASSISTANT]: `ASSISTING_REQUEST`,
} as const

export const RECIPIENT_ROLE_SIGNING_REASONS = {
  [RecipientRole.SIGNER]: `I am a signer of this document`,
  [RecipientRole.APPROVER]: `I am an approver of this document`,
  [RecipientRole.CC]: `I am required to receive a copy of this document`,
  [RecipientRole.VIEWER]: `I am a viewer of this document`,
  [RecipientRole.ASSISTANT]: `I am an assistant of this document`,
} satisfies Record<keyof typeof RecipientRole, string>
