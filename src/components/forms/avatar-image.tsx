import { useGlobalContext } from '@/context/GlobalContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { ErrorCode, useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { z } from 'zod'
import { extractInitials } from '../common/recipient-formatter'
import { cn } from '../lib/ClsxConnct'
import { formatAvatarUrl } from '../lib/utils/avatars'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'

export const ZAvatarImageFormSchema = z.object({
  bytes: z.string().nullish(),
})

export type TAvatarImageFormSchema = z.infer<typeof ZAvatarImageFormSchema>

export type AvatarImageFormProps = {
  className?: string
  team?: {
    id: number
    name: string
    avatarImageId: string | null
  }
  organisation?: {
    id: string
    name: string
    avatarImageId: string | null
  }
}

export const AvatarImageForm = ({
  className,
  team,
  organisation,
}: AvatarImageFormProps) => {
  const { user } = useGlobalContext()

  const initials = extractInitials(
    team?.name || organisation?.name || user.name || '',
  )
  const hasAvatarImage = useMemo(() => {
    if (team) {
      return team.avatarImageId !== null
    }

    if (organisation) {
      return organisation.avatarImageId !== null
    }

    return user.avatarImageId !== null
  }, [team, organisation, user.avatarImageId])

  const avatarImageId = team
    ? team.avatarImageId
    : organisation
    ? organisation.avatarImageId
    : user.avatarImageId

  const form = useForm<TAvatarImageFormSchema>({
    values: {
      bytes: null,
    },
    resolver: zodResolver(ZAvatarImageFormSchema),
  })

  const { getRootProps, getInputProps } = useDropzone({
    maxSize: 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: false,
    onDropAccepted: ([file]) => {
      void file.arrayBuffer().then((buffer) => {
        const contents = base64.encode(new Uint8Array(buffer))

        form.setValue('bytes', contents)
        void form.handleSubmit(onFormSubmit)()
      })
    },
    onDropRejected: ([file]) => {
      form.setError('bytes', {
        type: 'onChange',
        message: match(file.errors[0].code)
          .with(ErrorCode.FileTooLarge, () =>
            _(msg`Uploaded file is too large`),
          )
          .with(ErrorCode.FileTooSmall, () => `Uploaded file is too small`)
          .with(
            ErrorCode.FileInvalidType,
            () => `Uploaded file not an allowed file type`,
          )
          .otherwise(() => `An unknown error occurred`),
      })
    },
  })

  const onFormSubmit = async (data: TAvatarImageFormSchema) => {
    try {
      await setProfileImage({
        bytes: data.bytes,
        teamId: team?.id ?? null,
        organisationId: organisation?.id ?? null,
      })

      await refreshSession()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('flex flex-col gap-y-4 w-full', className)}
        // onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <fieldset
          className='flex flex-col gap-y-4 w-full'
          disabled={form.formState.isSubmitting}
        >
          <FormField
            control={form.control}
            name='bytes'
            render={() => (
              <FormItem>
                <FormLabel className='text-black'>Avatar</FormLabel>

                <FormControl>
                  <div className='flex gap-8 items-center mt-2'>
                    <div className='relative'>
                      <Avatar className='w-16 h-16 border-2 border-solid'>
                        {avatarImageId && (
                          <AvatarImage src={formatAvatarUrl(avatarImageId)} />
                        )}
                        <AvatarFallback className='text-sm text-gray-400'>
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {hasAvatarImage && (
                        <button
                          type='button'
                          className='flex absolute inset-0 justify-center items-center text-xs opacity-0 transition-opacity cursor-pointer bg-background/70 text-destructive hover:opacity-100'
                          disabled={form.formState.isSubmitting}
                          onClick={() => void onFormSubmit({ bytes: null })}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <Button
                      type='button'
                      variant=''
                      size='sm'
                      {...getRootProps()}
                      loading={form.formState.isSubmitting}
                      disabled={form.formState.isSubmitting}
                    >
                      Upload Avatar
                      <input {...getInputProps()} />
                    </Button>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
      </form>
    </Form>
  )
}
