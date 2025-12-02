
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/config/apiConfig';

const fetchDocument = async (documentId: string, folderId: string) => {
    if (!documentId ) return null;
    const { data } = await axiosInstance.get(`/api/v1/files/get-document`, {
        params: {
            documentId,
            signDocument: true,
            // teamId,
            folderId,
        },
    });
    return data;
};

export const useFetchSingDocument = (
  documentId: string,
  folderId: string,
) => {
  return useQuery({
    queryKey: ['document-get', documentId],
    queryFn: () => fetchDocument(documentId, folderId),
    enabled: !!documentId,
  })
}
