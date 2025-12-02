// import { useMutation } from '@tanstack/react-query'
import axiosInstance from '@/config/apiConfig';
import axios from 'axios'


export const convertToPdf = async (fileData: {
  file: File | ArrayBuffer | Uint8Array | string;
  fileName?: string;
  mimeType?: string;
}) => {
  const { data } = await axiosInstance.post(
    '/api/v1/files/convert-file',
    fileData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return data
}