import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { ZAddSubjectFormSchema } from '../schema/add-subject.types'
import { ZDocumentEmailSettingsSchema } from '../schema/document-email'
import { DocumentDistributionMethod, DocumentStatus } from '../schema/types'
import { AvatarWithText } from '../ui/avatar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useStep } from '../ui/stepper'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Textarea } from '../ui/textarea'
import { DocumentEmailCheckboxes } from './document-email-checkboxes'
import { DocumentReadOnlyFields } from './document-read-only-fields'
import {
  DocumentFlowFormContainerActions,
  DocumentFlowFormContainerContent,
  DocumentFlowFormContainerFooter,
  DocumentFlowFormContainerHeader,
  DocumentFlowFormContainerStep,
  DocumentFlowStepper,
} from './DocumentFlowRoot'

export type AddSubjectFormProps = {

  recipients: any[]
  document: any
  submitButtonText: string
  isSubmitting: boolean
  onSubmit: (_data: any) => void
}

export const AddSubjectFormPartial = ({
  isSubmitting,
  recipients: recipients,
  document,
  submitButtonText,
  onSubmit,
}: AddSubjectFormProps) => {

  const form = useForm({
    defaultValues: {
      meta: {
        emailId: document.documentMeta?.emailId ?? '',
        emailReplyTo: document.documentMeta?.emailReplyTo ?? (process.env.NEXT_PUBLIC_REPLY_TO_EMAIL ?? ''),
        // emailReplyName: document.documentMeta?.emailReplyName || undefined,
        subject: document.documentMeta?.subject ?? '',
        message: document.documentMeta?.message ?? '',
        distributionMethod:
          document.documentMeta?.distributionMethod ||
          DocumentDistributionMethod.EMAIL,
        emailSettings: ZDocumentEmailSettingsSchema.parse(
          document?.documentMeta?.emailSettings,
        ),
      },
    },
    resolver: zodResolver(ZAddSubjectFormSchema),
  })

  const { handleSubmit, setValue, watch } = form

  const emails = []

  const GoNextLabel = {
    [DocumentDistributionMethod.EMAIL]: {
      [DocumentStatus.DRAFT]: `Send`,
      [DocumentStatus.PENDING]: recipients.some(
        (recipient) => recipient.sendStatus === 'SENT',
      )
        ? `Resend`
        : `Send`,
      [DocumentStatus.COMPLETED]: `Update`,
      [DocumentStatus.REJECTED]: `Update`,
    },
    [DocumentDistributionMethod.NONE]: {
      [DocumentStatus.DRAFT]: `Generate Links`,
      [DocumentStatus.PENDING]: `View Document`,
      [DocumentStatus.COMPLETED]: `View Document`,
      [DocumentStatus.REJECTED]: `View Document`,
    },
  }

  const distributionMethod = watch('meta.distributionMethod')
  const emailSettings = watch('meta.emailSettings')

  const onFormSubmit = handleSubmit(onSubmit)
  const { currentStep, totalSteps, previousStep } = useStep()
  const getSubmitButtonText = () => {
    return (
      submitButtonText ||
      GoNextLabel[distributionMethod]?.[document?.status ?? ''] ||
      ''
    )
  };

  return (
    <>
      <DocumentFlowStepper currentStepIndex={4} />
      <DocumentFlowFormContainerHeader
        title={'Distribute Document'}
        description={'Choose how the document will reach recipients'}
      />
      <DocumentFlowFormContainerContent>
        <div className='flex flex-col'>
          <DocumentReadOnlyFields />

          <Tabs
            onValueChange={(value) =>
              setValue(
                'meta.distributionMethod',
                value as DocumentDistributionMethod,
              )
            }
            value={distributionMethod}
            className='mb-2'
          >
            <TabsList className='w-full rounded-xl'>
              <TabsTrigger
                className='w-full rounded-lg py-2.5'
                value={DocumentDistributionMethod.EMAIL}
              >
                Email
              </TabsTrigger>
              <TabsTrigger
           className='w-full rounded-lg py-2.5'
                value={DocumentDistributionMethod.NONE}
              >
                None
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <AnimatePresence mode='wait'>
            {distributionMethod === DocumentDistributionMethod.EMAIL && (
              <motion.div
                key={'Emails'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <Form {...form}>
                  <fieldset
                    className='flex flex-col gap-y-4 p-4 rounded-lg border'
                    disabled={form.formState.isSubmitting}
                  >

                    <FormField
                      control={form.control}
                      name='meta.emailId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Email Sender</FormLabel>

                          <FormControl>
                            <Select
                              {...field}
                              value={field.value || ''} // Remove the '-1' default
                              onValueChange={field.onChange} // Directly pass the value
                            >
                              <SelectTrigger
                                loading={false}
                                className='bg-white'
                              >
                                <SelectValue placeholder="Select an email sender" />
                              </SelectTrigger>

                              <SelectContent>
                                {emails.map((email) => (
                                  <SelectItem key={email.id} value={email.id}>
                                    {email.email}
                                  </SelectItem>
                                ))}

                                <SelectItem value={'no-reply@omnisai.io'}>OmnisAI</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={form.control}
                      name='meta.emailReplyTo'
                      render={() => (
                        <FormItem>
                          <FormLabel className='text-gray-700'>
                            Reply To Email <span className='text-muted-foreground'>(Optional)</span>
                          </FormLabel>

                          <FormControl>
                            <Input
                              value={process.env.NEXT_PUBLIC_REPLY_TO_EMAIL ?? "no-reply@omnisai.io"}
                              disabled
                              readOnly
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />




                    <FormField
                      control={form.control}
                      name='meta.subject'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Subject{' '}
                            <span className='text-muted-foreground'>
                              (Optional)
                            </span>
                          </FormLabel>

                          <FormControl>
                            <Input {...field}   className='bg-white' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='meta.message'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex flex-row items-center'>
                            Message{' '}
                            <span className='text-muted-foreground'>
                              (Optional)
                            </span>

                          </FormLabel>

                          <FormControl>
                            <Textarea
                              className='mt-2 h-16 bg-white resize-none'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DocumentEmailCheckboxes
                      className='mt-2'
                      value={emailSettings}
                      onChange={(value) =>
                        setValue('meta.emailSettings', value)
                      }
                    />
                  </fieldset>
                </Form>
              </motion.div>
            )}

            {distributionMethod === DocumentDistributionMethod.NONE && (
              <motion.div
                key={'Links'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className='rounded-lg border'
              >
                {document.status === DocumentStatus.DRAFT ? (
                  <div className='py-16 text-sm text-center text-muted-foreground'>
                    <p>{`We won't send anything to notify recipients.`}</p>

                    <p className='mt-2'>
                      We will generate signing links for you, which you can send
                      to the recipients through your method of choice.
                    </p>
                  </div>
                ) : (
                  <ul className='divide-y text-muted-foreground'>
                    {recipients.length === 0 && (
                      <li className='flex flex-col justify-center items-center py-6 text-sm'>
                        No recipients
                      </li>
                    )}

                    {recipients.map((recipient) => (
                      <li
                        key={recipient.id}
                        className='flex justify-between items-center px-4 py-3 text-sm'
                      >
                        <AvatarWithText
                          avatarFallback={recipient.email
                            .slice(0, 1)
                            .toUpperCase()}
                          primaryText={
                            <p className='text-sm text-muted-foreground'>
                              {recipient.email}
                            </p>
                          }

                        />


                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DocumentFlowFormContainerContent>

      <DocumentFlowFormContainerFooter>


        <DocumentFlowFormContainerActions
          loading={isSubmitting}
          disabled={isSubmitting}
          goNextLabel={
            getSubmitButtonText()
          }
          onGoBackClick={previousStep}
          onGoNextClick={() => void onFormSubmit()}
        />
      </DocumentFlowFormContainerFooter>
    </>
  )
}
