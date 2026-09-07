export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function isOverdue(dateString: string, receiptReceived: boolean, balanceAmount: number): boolean {
  if (receiptReceived || balanceAmount <= 0) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expected = new Date(dateString);
    expected.setHours(0, 0, 0, 0);
    return expected < today;
  } catch {
    return false;
  }
}

export function getDaysRemainingText(dateString: string, receiptReceived: boolean, balanceAmount: number): { text: string; isUrgent: boolean } {
  if (receiptReceived || balanceAmount <= 0) {
    return { text: 'Settled', isUrgent: false };
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expected = new Date(dateString);
    expected.setHours(0, 0, 0, 0);
    const diffTime = expected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, isUrgent: true };
    }
    if (diffDays === 0) {
      return { text: 'Due today', isUrgent: true };
    }
    if (diffDays === 1) {
      return { text: 'Due tomorrow', isUrgent: false };
    }
    return { text: `Due in ${diffDays}d`, isUrgent: false };
  } catch {
    return { text: '', isUrgent: false };
  }
}
