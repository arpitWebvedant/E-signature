import { email } from 'zod'

// Memoize user email to avoid recalculating
export const modifyStepData = (
  stepData: any,
  recipient?: string,
  email?: string,
) => {
  const userEmail = recipient || email

  const data = stepData?.fields?.map((field: any) => {
    if (Array.isArray(field.signature)) {
      return {
        ...field,
        signature: field.signature.find(
          (signature: any) => signature.email === userEmail,
        ),
      }
    }
    return field
  })

  return { ...stepData, fields: data }
}

export const upDateText = (
  originalField: any,
  field: any,
  value: any,
  email?: string,
) => {
  const userEmail = originalField?.signerEmail || email
  const mapData = Array.isArray(originalField.customText)
    ? originalField.customText
    : field.recipients
  const filedData = mapData.map((item: any) => {
    return item.email === userEmail
      ? {
          email: item.email,
          text: value,
        }
      : {
          text: item.text || '',
          email: item.email,
        }
  })
  // const fixField = filedData.filter((f: any) => f.text !== '')
  return {
    ...field,
    inserted: true,
    customText: filedData,
  }
}

export const getModifiedData = (field: any, email?: string) => {
  const signatureData = Array.isArray(field.customText)
    ? field.customText.find((signature: any) => signature.email === email)
    : field.customText

  const modifiedField = {
    ...field,
    inserted: signatureData?.text && signatureData.text !== '',
    customText: signatureData?.text || '',
  }

  return modifiedField
}
