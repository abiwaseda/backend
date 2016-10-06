// API endpoint handlers
import {
    ChargeHandler
} from './handlers';

export default [
    {
        path: '',
        method: 'GET',
        config: {
            handler: {async: ChargeHandler.get}
        }
    },
	{
        path: '',
        method: 'POST',
        config: {
            handler: {async: ChargeHandler.post}
        }
    }
]