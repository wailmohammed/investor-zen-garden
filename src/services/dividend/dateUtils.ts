
// Date utility functions for dividend calculations
export const getNextExDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // Approximate next ex-dividend date
  return date.toISOString().split('T')[0];
};

export const getNextPaymentDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 45); // Approximate next payment date
  return date.toISOString().split('T')[0];
};
