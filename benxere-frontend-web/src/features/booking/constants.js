export const BookingSteps = {
  PASSENGER_INFO: 'passenger_info',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation',
};

export const PaymentMethods = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
};

export const PaymentMethodLabels = {
  [PaymentMethods.CREDIT_CARD]: 'Thẻ tín dụng',
  [PaymentMethods.DEBIT_CARD]: 'Thẻ ATM',
  [PaymentMethods.BANK_TRANSFER]: 'Chuyển khoản',
};