import { z } from 'zod'

import { OrganisationMemberRole, TeamMemberRole } from '../../schema/types'
import { ZOrganisationSchema } from './organisation'
import SubscriptionSchema from './SubscriptionSchema'
import TeamSchema from './TeamSchema'

export const ZGetOrganisationSessionResponseSchema = ZOrganisationSchema.extend(
  {
    teams: z.array(
      TeamSchema.pick({
        id: true,
        name: true,
        url: true,
        createdAt: true,
        avatarImageId: true,
        organisationId: true,
      }).extend({
        currentTeamRole: z.nativeEnum(TeamMemberRole),
      }),
    ),
    subscription: SubscriptionSchema.nullable(),
    currentOrganisationRole: z.nativeEnum(OrganisationMemberRole),
  },
).array()

export type TGetOrganisationSessionResponse = z.infer<
  typeof ZGetOrganisationSessionResponseSchema
>

export type TeamSession =
  TGetOrganisationSessionResponse[number]['teams'][number]
export type OrganisationSession = TGetOrganisationSessionResponse[number]
