
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/config/apiConfig';

const fetchDocument = async (documentId: string, userId: string, folderId: string, token?: string) => {
    if (!documentId || !userId ) return null;
    const { data } = await axiosInstance.get(`/api/v1/files/get-document`, {
        params: {
            documentId,
            userId,
            // teamId,
            folderId,
            token,
        },
    });
    return data;
};

export const useFetchDocument = (
  documentId: string,
  userId: string,
  folderId: string,
  token?: string,
) => {
  return useQuery({
    queryKey: ['document-get', documentId],
    queryFn: () => fetchDocument(documentId, userId, folderId, token),
    enabled: !!documentId,
  })
}
