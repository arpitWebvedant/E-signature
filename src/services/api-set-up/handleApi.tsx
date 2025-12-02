import axiosInstance, { getApiBaseUrl } from '@/config/apiConfig'

const API_BASE = '/api/v1'

// ---------- FOLDER APIs ----------
export const createFolder = async (data: any) => {
  const { data: response } = await axiosInstance.post(`${API_BASE}/folders/create`, data)
  return response
}

export const listFolders = async (params?: any) => {
  try {
    const { data: response } = await axiosInstance.get(`${API_BASE}/folders/list`, {
      params,
    })
    return response
  } catch (error) {
    console.log(error)
  }
}

export const renameFolder = async (folderId: number, newName: string) => {
  const { data: response } = await axiosInstance.put(`${API_BASE}/folders/${folderId}/rename`, {
    name: newName,
  })
  return response
}

export const deleteFolder = async (params: any) => {

  const { data: response } = await axiosInstance.delete(`${API_BASE}/folders/delete`, {
    params,
  })
  return response
}

export const createPath = async (data: any) => {
  const { data: response } = await axiosInstance.post(`${API_BASE}/folders/create-path`, data)
  return response
}

export const moveFolder = async (folderId: number, pathId: number) => {
  const { data: response } = await axiosInstance.put(`${API_BASE}/folders/${folderId}/move`, {
    pathId,
  })
  return response
}
export const pinFolder = async (folderId: string) => {
  const { data: response } = await axiosInstance.put(`${API_BASE}/folders/${folderId}/pin`)
  return response
}

  export const unpinFolder = async (folderId: string) => {
    const { data: response } = await axiosInstance.put(`${API_BASE}/folders/${folderId}/unpin`)
    return response
  }

// ---------- API KEY APIs ----------
export const createApiKey = async (payload: any) => {
  const sessionToken = localStorage.getItem('next_app_session_token') 
  const { data } = await axiosInstance.post(
    `${API_BASE}/auth/api-keys`,
    payload,
    { 
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return data
}

export const listApiKeys = async (params?: any) => {
  const sessionToken = localStorage.getItem('next_app_session_token') 
  const { data } = await axiosInstance.get(`${API_BASE}/auth/api-keys`, {
    params,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    },
  })
  return data
}

export const revokeApiKey = async (id: number | string) => {
  const sessionToken = localStorage.getItem('next_app_session_token') 
  const { data } = await axiosInstance.delete(`${API_BASE}/auth/api-keys/${id}` , {
   
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    },
  })
  return data
}