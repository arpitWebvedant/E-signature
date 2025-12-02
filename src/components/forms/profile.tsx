import { useGlobalContext } from '@/context/GlobalContext'
import centralizedAuthService from '@/services/auth/centralizedAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '../lib/ClsxConnct'
import SignaturePadDialog from '../signature-modal/SignaturePadDialog'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export const ZProfileFormSchema = z.object({
  fullName: z.string().trim().min(1, { message: `Please enter a valid name.` }),
  signature: z.string().min(1, { message: `Signature Pad cannot be empty.` }),
})

export const ZTwoFactorAuthTokenSchema = z.object({
  token: z.string(),
})

export type TTwoFactorAuthTokenSchema = z.infer<
  typeof ZTwoFactorAuthTokenSchema
>
export type TProfileFormSchema = z.infer<typeof ZProfileFormSchema>

export type ProfileFormProps = {
  className?: string
}

export const ProfileForm = ({ className }: { className?: string }) => {
  const { user, autoLoginWithCentralizedAuth } = useGlobalContext()

  const form = useForm<TProfileFormSchema>({
    values: {
      fullName: user.data?.user?.fullName ?? user.data?.user?.name ?? '',
      signature: user.data?.user?.signature ?? '',
    },
    resolver: zodResolver(ZProfileFormSchema),
  })
  const isSubmitting = form.formState.isSubmitting
  const onFormSubmit = async ({ fullName, signature }: TProfileFormSchema) => {
    try {
      const result = await centralizedAuthService.updateLocalProfile({
        fullName,
        signature,
      })
      if (result.success) {
        // Update global context with new user data
        autoLoginWithCentralizedAuth()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <Form {...form}>
      <form
        className={cn('flex flex-col gap-y-4 w-full', className)}
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <fieldset
          className='flex flex-col gap-y-4 w-full'
          disabled={isSubmitting}
        >
          <FormField
            control={form.control}
            name='fullName'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-black'>Full Name</FormLabel>
                <FormControl>
                  <Input type='text' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Label htmlFor='email' className='text-muted-foreground'>
              Email
            </Label>
            <Input
              id='email'
              type='email'
              className='mt-2 bg-muted'
              value={user.data?.user?.email ?? ''}
              disabled
            />
          </div>

          <FormField
            control={form.control}
            name='signature'
            render={({ field: { onChange, value } }) => (
              <FormItem>
                <FormLabel className='text-black'>Signature</FormLabel>
                <FormControl>
                  <div className='mt-2'>
                    <SignaturePadDialog
                      disabled={isSubmitting}
                      value={value}
                      onChange={(v) => onChange(v ?? '')}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <Button type='submit' loading={isSubmitting} className='self-end'>
          Update profile
        </Button>
      </form>
    </Form>
  )
}
