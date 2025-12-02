import { Recipient } from "@/components/schema/types"

export interface Document {
  id: string
  title: string
  file: string
  documentMeta: any
  recipients: Recipient[]
  fileType: string
}
export interface DocumentData {
  id: string
  title: string
  documentData: {
    initialData: string
    fileType: string
  }
  documentMeta: any
  recipients: Recipient[]
  documentSignData?: any // Replace with actual type if known
}