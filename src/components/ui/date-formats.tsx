import moment from "moment";

export const DEFAULT_DOCUMENT_DATE_FORMAT = "MM/DD/YYYY";

export const VALID_DATE_FORMAT_VALUES = [
  DEFAULT_DOCUMENT_DATE_FORMAT,
  "YYYY-MM-DD",
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YY-MM-DD",
  "MMMM DD, YYYY",
  "dddd, MMMM DD, YYYY",
  moment.ISO_8601, // ISO 8601 support
] as const;

export type ValidDateFormat = (typeof VALID_DATE_FORMAT_VALUES)[number];

export const DATE_FORMATS = [
  { key: "YYYYMMDD", label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
  { key: "DDMMYYYY", label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { key: "MMDDYYYY", label: "MM/DD/YYYY", value: DEFAULT_DOCUMENT_DATE_FORMAT },
  { key: "YYMMDD", label: "YY-MM-DD", value: "YY-MM-DD" },
  { key: "MonthDateYear", label: "Month Date, Year", value: "MMMM DD, YYYY" },
  { key: "DayMonthYear", label: "Day, Month Year", value: "dddd, MMMM DD, YYYY" },
  { key: "ISO8601", label: "ISO 8601", value: moment.ISO_8601 },
] satisfies { key: string; label: string; value: (typeof VALID_DATE_FORMAT_VALUES)[number] }[];

export const convertToLocalSystemFormat = (
  customText: string | null,
  dateFormat: string | null = DEFAULT_DOCUMENT_DATE_FORMAT,
): string => {
  const coalescedDateFormat = dateFormat ?? DEFAULT_DOCUMENT_DATE_FORMAT;

  const input =
    typeof customText === "string" && customText.trim()
      ? customText.trim()
      : null;

  let parsedDate: moment.Moment;

  if (input) {
    parsedDate = moment(input, moment.ISO_8601, true);
    
    if (!parsedDate.isValid()) {
      parsedDate = moment(input, coalescedDateFormat, true);
    }
    
    if (!parsedDate.isValid()) {
      parsedDate = moment(input);
    }
  } else {
    parsedDate = moment();
  }

  if (!parsedDate.isValid()) {
    parsedDate = moment();
  }

  return parsedDate.format(coalescedDateFormat);
};

export const isValidDateFormat = (
  dateFormat: any,
): dateFormat is ValidDateFormat => {
  return VALID_DATE_FORMAT_VALUES.includes(dateFormat as ValidDateFormat);
};
