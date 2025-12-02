import React, { createContext, useContext } from 'react'

import type { OrganisationSession } from './meta/get-organisation-session.types'

type OrganisationProviderValue = OrganisationSession

interface OrganisationProviderProps {
  children: React.ReactNode
  organisation: OrganisationProviderValue | null
}

const OrganisationContext = createContext<OrganisationProviderValue | null>(
  null,
)

export const useCurrentOrganisation = () => {
  const context = useContext(OrganisationContext)

  if (!context) {
    return null
  }

  return context
}

export const useOptionalCurrentOrganisation = () => {
  return useContext(OrganisationContext)
}

export const OrganisationProvider = ({
  children,
  organisation,
}: OrganisationProviderProps) => {
  return (
    <OrganisationContext.Provider value={organisation}>
      {children}
    </OrganisationContext.Provider>
  )
}
