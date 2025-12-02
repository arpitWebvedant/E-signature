export interface CentralizedAuthUser {
  id: string
  email: string
  name: string
  image?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  organizationUsers?: Array<{
    id: string
    userId: string
    organizationId: string
    roleId: string
    status: string
    organization: {
      id: string
      name: string
      slug: string
      type?: string
    }
    role: {
      id: string
      name: string
      permissions?: any
    }
    userRoles?: Array<{
      id: string
      userId: string
      roleId: string
      role: {
        id: string
        name: string
        description: string
      }
    }>
  }>
}

export interface CentralizedAuthSession {
  user: CentralizedAuthUser
  session: {
    id: string
    token: string
    expiresAt: string
    userId: string
  }
}

export interface SessionValidationResponse {
  success: boolean
  user?: CentralizedAuthUser
  localUser?: any
  organization?: any
  userRole?: any
  session?: any
  message?: string
  redirectToAuth?: boolean
  organizationStatus?: string
  organizationName?: string
}

export interface UpdateProfileResponse {
  success: boolean
  user?: CentralizedAuthUser
  message?: string
  redirectToAuth?: boolean
}

export type User = {
  id: string
  email: string
  name: string
}

export type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  
  loading: boolean
}
