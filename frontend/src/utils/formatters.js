/**
 * ScamQuest Presentation & Formatting Helpers
 */

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount).toLocaleString('en-IN');
  return isNegative ? `-₹${absVal}` : `₹${absVal}`;
}

export function formatNumber(num) {
  return (num || 0).toLocaleString('en-IN');
}

export const SCAM_TYPE_META = {
  FAKE_KYC: { label: 'Fake Bank KYC Suspension', tag: 'Identity Theft' },
  UPI_COLLECT: { label: 'Deceptive UPI Collect Request', tag: 'UPI Trap' },
  WRONG_PAYMENT_REFUND: { label: 'Wrong Transfer Refund Scam', tag: 'Social Engineering' },
  JOB_OFFER_SCAM: { label: 'Work-from-Home Task Scam', tag: 'Advance Fee' },
  LOTTERY_PRIZE: { label: 'Fake Lottery & Prize Claim', tag: 'Advance Fee' },
  ELECTRICITY_DISCONNECT: { label: 'Electricity Disconnection Notice', tag: 'Urgent Threat' },
  PHISHING_LINK: { label: 'Phishing Link / Malicious APK', tag: 'Malware' },
  FAKE_CUSTOMER_SUPPORT: { label: 'Fake Customer Helpline', tag: 'Impersonation' },
  QR_CODE_SCAM: { label: 'Deceptive Payment QR Code', tag: 'UPI Trap' },
  REMOTE_ACCESS_APP: { label: 'Remote Screen Share App', tag: 'Device Takeover' },
  IMPERSONATION: { label: 'Digital Arrest / Official Coercion', tag: 'Extortion' },
  INVESTMENT_SCAM: { label: 'High-Yield Investment Group', tag: 'Financial Fraud' },
  SAFE_TRANSACTION: { label: 'Legitimate Merchant Debit', tag: 'Verified Genuine' },
  SAFE_BILL_PAYMENT: { label: 'Verified Utility Receipt', tag: 'Verified Genuine' },
  SAFE_SALARY_CREDIT: { label: 'Official Salary Deposit', tag: 'Verified Genuine' },
  SAFE_PEER_TRANSFER: { label: 'Friend Split Payment', tag: 'Verified Genuine' },
};

export function getScamTypeMeta(type) {
  return SCAM_TYPE_META[type] || { label: type?.replace(/_/g, ' ') || 'Notification', tag: 'Notice' };
}
