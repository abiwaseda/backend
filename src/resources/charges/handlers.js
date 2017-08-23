/**
 * Imports
 */
import csv from 'fast-csv';

import {ErrorName} from '../../core/errors';
import {BadRequest} from '../../core/responses';
import {hasKeys, hasValue} from '../../core/utils';
import config from '../../config';
import log from './logging';
import {sanitizeEmailAddress, sendTemplate as sendEmailTemplate, EmailTemplate} from '../../core/email';

//import Handlers, Serializers and Models
import {CheckoutSerializer} from '../checkouts/serializers';
import {Checkout} from '../checkouts/models';
import {Order, OrderStatus} from '../orders/models';
import {OrderSerializer} from '../orders/serializers';
import {PaymentStatus, PaymentProvider} from './models';

var stripe = require("stripe")(
      config.stripePayments.privateKey
    );

class StripeChargeHandler {

    /**
     * Process GET request
     */
    static async post(request, reply) {
        // Check if Stripe Payments are enabled
        if (!config.stripePayments.enabled) {
            log.warn({orderId: request.payload.orderId, query: request.query}, '[Stripe Payments] Disabled');
            return reply().code(401);
        }

        // Check if order ID exists and is in appropriate state (i.e. created or pending payment)
        let order = await Order.get(request.payload.orderId);

        if (!order) {
            log.warn({orderId: request.payload.orderId, type: request.payload.payType}, '[Stripe Payments] Invalid orderId');
            return reply().code(404);
        }

        let checkout = new Checkout(await Checkout.get(order.checkoutId));
//        let orderSerial = new OrderSerializer(order).serialize({appendCheckout: true});

        if (request.payload.payType === "create") {
            if (order.status !== OrderStatus.CREATED && order.status !== OrderStatus.PENDING_PAYMENT) {
                log.warn({orderId: request.payload.orderId, type: request.payload.payType}, '[Stripe Payments] Order is NOT created or pending payment');
                return reply({message: 'Order is not pending payment'}).code(400);
            }
            // Fetch event and act accordingly
            log.debug({orderId: request.params.orderId, type: request.payload.payType}, '[Stripe Payments] Processing event');


            var tokenn = request.payload;
            var id = tokenn.id;
            log.debug("Stripe token ID "+ id);
            log.debug("calling stripe api for charge");
            stripe.charges.create({
                amount: checkout.getTotal(),
                currency: "jpy",
                capture: false,
                source: id,
                description: "Charge for " + tokenn.email
            }, function(err, charge) {
                if (err) {
                    log.warn("Error occurred in Stripe call charge : " + err);
                    return reply({message: 'Error occurred in stripe'}).code(500);
                } else {
                    Order.updatePaymentLog(order.id, {
                                            provider: PaymentProvider.STRIPE_PAYMENTS,
                                            type: PaymentStatus.AUTHORIZED_PAYMENT,
                                            date: new Date(),
                                            chargeId: charge.id
                                        });
                    Order.updateStatus(order.id, OrderStatus.AUTHORIZED_PAID, 'Authorized Stripe Payment');
                    Order.updateChargeId(order.id, charge.id);
                    log.debug("Stripe auth charge success : " + JSON.stringify(charge));
                    return reply({message: 'Stripe auth success'}).code(200);
                }
            });

        } else if (request.payload.type === "capture") {
            if (order.status !== OrderStatus.AUTHORIZED_PAID ) {
                log.warn({orderId: request.payload.orderId, type: request.payload.payType}, '[Stripe Payments] Cant capture because order payment is NOT authorized yet');
                return reply({message: 'Order payment is not authorized'}).code(400);
            }

            await stripe.charges.capture(order.chargeId, function(err, charge) {
                if (err) {
                    log.warn("Error occurred in stripe call capture : " + JSON.stringify(err));
                    return reply({message: 'Error occurred in stripe'}).code(500);
                } else {
                    log.debug("Stripe capture charge success : " + JSON.stringify(charge));
                }
            });

            await Order.updatePaymentLog(order.id, {
                                    provider: PaymentProvider.STRIPE_PAYMENTS,
                                    type: PaymentStatus.CAPTURED_PAYMENT,
                                    date: new Date()
                                });
            await Order.updateStatus(order.id, OrderStatus.CAPTURED_PAID, 'Captured stripe payment');
            order = await Order.get(request.payload.orderId);
            return reply(await new OrderSerializer(order).serialize({appendCheckout: true}));

        } else {
            return reply({message: 'error occurred : incorrect payType'}).code(400);
        }
    }
}

/**
 * Exports
 */
export {
    StripeChargeHandler
};