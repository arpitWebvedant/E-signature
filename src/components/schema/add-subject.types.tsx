import { z } from 'zod'
import { ZDocumentEmailSettingsSchema } from './document-email'

export const ZAddSubjectFormSchema = z.object({
  meta: z.object({
    emailId: z.string().min(1, 'Email sender is required'),
    emailReplyTo: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.string().email().optional(),
    ),
    // emailReplyName: z.string().optional(),
    subject: z.string(),
    message: z.string(),
    distributionMethod: z.string(),
    emailSettings: ZDocumentEmailSettingsSchema,
  }),
})

export type TAddSubjectFormSchema = z.infer<typeof ZAddSubjectFormSchema>
