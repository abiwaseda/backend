// API endpoint handlers
import {
    StripeChargeHandler
} from './handlers';

export default [
	{
        path: '/stripe',
        method: 'POST',
        config: {
            handler: {async: StripeChargeHandler.post}
        }
    }
]