/**
 * Imports
 */
import csv from 'fast-csv';

import {ErrorName} from '../../core/errors';
import {BadRequest} from '../../core/responses';
import {hasKeys, hasValue} from '../../core/utils';
import config from '../../config';
import log from './logging';
import ChargeLogic from './chargeLogic';
//import {Product} from './models';
//import {ProductSerializer} from './serializers';
import {CheckoutSerializer} from '../checkouts/serializers';
import {Checkout} from '../checkouts/models';
import {Order, OrderStatus, PaymentProvider} from '../orders/models';
import {OrderSerializer} from '../orders/serializers';

var stripe = require("stripe")(
      config.stripePayments.privateKey
    );

class ChargeHandler {

    /**
     * Process GET request
     */
    static async get(request, reply) {
    	/*
        let product = await Product.get(request.params.productId);
        // Note: Only authenticated Admins can see products that are not enabled
        let isAdmin = request.auth.credentials && request.auth.credentials.scope && request.auth.credentials.scope.indexOf('admin') !== -1;
        if (product && (product.enabled === true || isAdmin)) {
            return reply(await new ProductSerializer(product).serialize());
        } else {
            return reply().code(404);
        }*/

        let token = request.body;
        console.log("test1"+token);
    }

    /**
     * Process GET request
     */
    static async post(request, reply) {

        // Check if Stripe Payments are enabled
        if (!config.stripePayments.enabled) {
            log.warn({orderId: request.params.orderId, query: request.query}, '[Stripe Payments] Disabled');
            return reply().code(401);
        }

        // Check if order ID exists and is in appropriate state (i.e. created or pending payment)
        let order = await Order.get(request.payload.orderId);
        if (!order) {
            log.warn({orderId: request.payload.orderId, eventId: request.query.event}, '[Stripe Payments] Invalid orderId');
            return reply().code(404);
        } else if (order.status !== OrderStatus.CREATED && order.status !== OrderStatus.PENDING_PAYMENT) {
            log.warn({orderId: request.payload.orderId, eventId: request.query.event}, '[Stripe Payments] Order is NOT created or pending payment');
            return reply({message: 'Order is not pending payment'}).code(400);
        }
        // Fetch event and act accordingly
        log.debug({orderId: request.params.orderId, eventId: request.query.event}, '[Stripe Payments] Processing event');
        let checkout = new Checkout(await Checkout.get(order.checkoutId));

        var tokenn = request.payload;
        var id = tokenn.id;
        log.debug("Token ID "+ id);
        log.debug("calling stripe api for charge");
        stripe.charges.create({
            amount: checkout.getTotal(),
            currency: "jpy",
            //customer: "cus_9Ch533qePPCtTw", // obtained with Stripe.js
            source: id,
            description: "Charge for " + tokenn.email
        }, function(err, charge) {
            if (err) {
                log.debug("error occured : " + err);
            } else {
                log.debug("charge success : " + charge);
            }
        });

        return reply(tokenn).code(200);
    }

    /**
     * Process PUT request
     */
     /*
    static async put(request, reply) {

        // Check if product with given ID exists
        let product = await Product.get(request.params.productId);
        if (!product) {
            return reply().code(404);
        }

        // Update product
        try {
            product = await Product.update(request.params.productId, request.payload);
            return reply(await new ProductSerializer(product).serialize());
        } catch (err) {
            if (err.name === ErrorName.VALIDATION_ERROR) {
                return reply(BadRequest.invalidParameters('payload', {[err.param]: [err.message]})).code(400);
            } else {
                log.error(err, 'Unable to update product');
                return reply().code(500);
            }
        }
    }
    */
}

/**
 * Exports
 */
export {
    ChargeHandler
};