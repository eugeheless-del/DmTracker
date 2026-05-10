/**
 * Safely formats a date string/number to a readable format in Russian
 * Handles invalid dates, null/undefined values, and non-string inputs
 */
export const formatDate = (dateValue: string | number | null | undefined): string => {
  // Handle empty/null/undefined values
  if (!dateValue) {
    return 'Дата не указана';
  }

  // Handle non-string types (numbers passed as dates)
  if (typeof dateValue !== 'string') {
    console.warn('Invalid date type:', typeof dateValue, 'value:', dateValue);
    return 'Дата не указана';
  }

  // Trim whitespace
  const trimmedDate = dateValue.trim();
  if (!trimmedDate) {
    return 'Дата не указана';
  }

  try {
    const date = new Date(trimmedDate);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateValue);
      return 'Дата не указана';
    }

    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'value:', dateValue);
    return 'Дата не указана';
  }
};
