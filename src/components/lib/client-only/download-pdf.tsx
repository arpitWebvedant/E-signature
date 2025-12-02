import { getFile } from '../universal/upload/get-file'


type DocumentVersion = 'original' | 'signed'

type DownloadPDFProps = {
  documentData: any
  documentId: number
  fileName?: string
  userId?: number
  email?: string
  /**
   * Specifies which version of the document to download.
   * 'signed': Downloads the signed version (default).
   * 'original': Downloads the original version.
   */
  version?: DocumentVersion
}

export const downloadPDF = async ({
  documentData,
  documentId,
  fileName,
  userId,
  version = 'signed',
  email
}: DownloadPDFProps) => {
  const bytes = await getFile({
    documentId,
    data: version === "signed" ? documentData.data : documentData.initialData,
    userId,
    email
  });

  const baseTitle = (fileName ?? "document").replace(/\.(pdf|docx)$/i, "");
  const suffix = version === "signed" ? "_signed.pdf" : ".pdf";

  // Create blob
  const blob = new Blob([bytes], { type: "application/pdf" });

  // Download via anchor
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseTitle}${suffix}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

