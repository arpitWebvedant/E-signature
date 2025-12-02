import { base64 } from '@scure/base'
import { match } from 'ts-pattern'
import axiosInstance, { getApiBaseUrl } from "@/config/apiConfig";

export type FileType = 'BYTES' | 'BYTES_64' | 'S3_PATH'

export type GetFileOptions = {
  type: FileType
  data: string
  documentId?: number
  userId?: number
  email?: string
}


// export const getFile = async ({ type, data, documentId, userId, email }: GetFileOptions) => {
//   return await match(type)
//     .with('BYTES', () => getFileFromBytes(data))         
//     .with('BYTES_64', () => getFileFromBytes64(data))   
//     .with('S3_PATH', () => getFileFromS3(data, documentId,userId,email))
//     .exhaustive()
// }

// const getFileFromBytes = (data: string) => {
//   const encoder = new TextEncoder()
//   return encoder.encode(data)
// }

// const getFileFromBytes64 = (data: string) => {
//   return base64.decode(data)
// }

// const getFileFromS3 = async (key: string, documentId?: number, userId?: number,email?: string) => {

//   const response = await fetch(
//     `${getApiBaseUrl()}/api/v1/files/presigned-get-url`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ key, documentId, userId,email }),
//     }
//   )

//   if (!response.ok) {
//     throw new Error(
//       `Failed to fetch file with key "${key}", failed with status code ${response.status}`
//     )
//   }

//   // Return raw PDF bytes directly
//   return await response.arrayBuffer()
// }
export const getFile = async ({
  data,
  documentId,
  userId,
  email,
}: {
  data: string
  documentId?: number
  userId?: number
  email?: string
}) => {
  return await getFileFromS3(data, documentId, userId, email)
}

const getFileFromS3 = async (
  key: string,
  documentId?: number,
  userId?: number,
  email?: string
) => {
  const response = await axiosInstance.post(
    `${getApiBaseUrl()}/api/v1/files/presigned-get-url`,
    { key, documentId, userId, email },
    {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'arraybuffer',
    },
  )

  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch file with key "${key}", failed with status code ${response.status}`
    )
  }

  // Return raw PDF bytes directly
  return response.data
}