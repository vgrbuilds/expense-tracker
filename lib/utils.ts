/**
 * Format a numeric value into Indian Rupees (INR) format (e.g., ₹15,000.00)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Export expense records to a downloadable CSV spreadsheet
 */
export function exportExpensesToCSV(expenses: any[], filename = 'SpendWise_Expenses.csv') {
  if (!expenses || expenses.length === 0) return;

  const headers = ['Category', 'Amount (INR)', 'Date', 'Description', 'Vendor', 'Spent For', 'Payment Method', 'Frequency'];

  const rows = expenses.map((e) => [
    `"${(e.category || '').replace(/"/g, '""')}"`,
    e.amount,
    `"${e.date}"`,
    `"${(e.description || e.title || '').replace(/"/g, '""')}"`,
    `"${(e.vendor || '').replace(/"/g, '""')}"`,
    `"${(e.spent_for || 'Self').replace(/"/g, '""')}"`,
    `"${e.payment_method || 'Online'}"`,
    e.is_recurring ? 'Recurring' : 'One-time',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
