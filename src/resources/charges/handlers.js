/**
 * Imports
 */
import csv from 'fast-csv';

import {ErrorName} from '../../core/errors';
import {BadRequest} from '../../core/responses';
import {hasKeys, hasValue} from '../../core/utils';

import log from './logging';
import ChargeLogic from './chargeLogic';
//import {Product} from './models';
//import {ProductSerializer} from './serializers';

var stripe = require("stripe")(
      "sk_test_4q5rCVkqyTUe4dQWnQ7rCzY7"
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
        var tokenn = request.payload;
        var id = tokenn.id;
        log.debug("Token ID "+ id);
        log.debug("calling stripe api for charge");
        stripe.charges.create({
            amount: 2000,
            currency: "jpy",
            //customer: "cus_9Ch533qePPCtTw", // obtained with Stripe.js
            source: id,
            description: "Charge for " + tokenn.email
        }, function(err, charge) {
            if (err) {
                console.log("error occured : " + err);
            } else {
                console.log("charge success : " + charge);
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