/**
 * Imports
 */
//import {rethinkdb, Decorators as DBDecorators} from '../../core/db';
import {ValidationError} from '../../core/errors';

/**
 * Possible payment states
 */
const PaymentStatus = {
    AUTHORIZED_PAYMENT: 'authorized', //only authorized but not captured
    PENDING_PAYMENT: 'pendingPayment',
    PAYMENT_ERROR: 'paymentError',
    PAID: 'paid',
    CANCELED: 'canceled',
    PROCESSING: 'processing',
    READY: 'ready',
    CAPTURED_PAYMENT: 'captured'
};

/**
 * Available payment providers
 */
const PaymentProvider = {
    STRIPE_PAYMENTS: 'stripe'
};

/**
 * Exports
 */
export {
    PaymentStatus,
    PaymentProvider
};