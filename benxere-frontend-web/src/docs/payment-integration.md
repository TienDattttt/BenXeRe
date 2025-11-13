# Payment Integration Implementation

## Overview
The payment system integrates ZaloPay, Momo, and VNPay payment gateways into the BenXeSo booking flow. 

## Components

### 1. PaymentMethodSelector
Located in `src/components/payment/payment-method-selector.jsx`
- Displays available payment methods
- Handles payment method selection
- Shows payment gateway logos and descriptions

### 2. PaymentForm
Located in `src/components/payment/payment-form.jsx`
- Manages the payment process
- Shows order summary
- Handles payment gateway redirections

### 3. PaymentComplete Page
Located in `src/pages/payment/complete.js`
- Handles payment gateway callbacks
- Shows payment status (success/failure)
- Redirects to order history after successful payment

## Services

### Payment Service
Located in `src/services/payment-service.js`

```javascript
// Create a new payment
const payment = await createPayment({
  bookingId: "booking_id",
  paymentMethod: "ZALOPAY",
  amount: 100000
});

// Check payment status
const status = await getPaymentStatus(paymentId);
```

## Integration Flow

1. User fills passenger information in booking modal
2. User selects payment method using PaymentMethodSelector
3. PaymentForm creates payment and redirects to gateway
4. Gateway processes payment and redirects back
5. PaymentComplete page handles callback and shows status

## Environment Configuration

Required environment variables in `.env`:
```
# ZaloPay Configuration
ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_KEY1=your_zalopay_key1
ZALOPAY_KEY2=your_zalopay_key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2

# Momo Configuration
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn
# Note: The complete MoMo API endpoint for payment creation should be:
# MOMO_ENDPOINT + "/v2/gateway/api/create"
# Make sure your backend appends this path when making API requests

# VNPay Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_ENDPOINT=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:8080/payment/complete
```

## Testing

1. Use sandbox credentials for development
2. Test each payment method with test cards/accounts
3. Verify payment status updates
4. Test error scenarios and cancellations
5. Verify callback handling and database updates

## Production Deployment

1. Replace sandbox credentials with production ones
2. Update payment gateway endpoints
3. Configure proper SSL for payment callbacks
4. Set up payment monitoring and logging
5. Test thoroughly in staging environment

## Error Handling

The system handles various error scenarios:
- Invalid payment creation
- Gateway timeout/errors
- Failed transactions
- Invalid callbacks
- Network issues

Users are shown appropriate error messages and can retry payments when needed.