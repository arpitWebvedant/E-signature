'use client'
import { SettingsHeader } from '@/components/general/settings-header'
import { AvatarImageForm } from '@/components/forms/avatar-image'
import { ProfileForm } from '@/components/forms/profile'

export default function ProfilePage() {
  return (
    <div className=''>
      <SettingsHeader
        title={`Profile`}
        subtitle={`Here you can edit your personal details.`}
      />
      {/* <AvatarImageForm className='mb-8 max-w-xl' /> */}
      <ProfileForm className='mb-8 max-w-xl' />
    </div>
  )
}
