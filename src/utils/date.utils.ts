/**
 * Common function to disable to_date calendar picker options before the selected from_date
 * @param fromDate - Selected start date
 * @returns Date object or undefined to pass to DateTimePickerModal minimumDate prop
 */
export const disableToDateBeforeFromDate = (fromDate: string | Date | null | undefined): Date | undefined => {
  if (!fromDate) return undefined;
  try {
    const d = new Date(fromDate);
    if (isNaN(d.getTime())) return undefined;
    return d;
  } catch (error) {
    console.error("Error formatting minimumDate:", error);
    return undefined;
  }
};
