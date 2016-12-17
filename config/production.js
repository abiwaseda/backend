// Base configuration
import config from './development';

//Override configurations for Production environment
//config.app.routePrefix = '/api';
config.logs.folder = '/var/log/yamacity';
config.logs.streams = [
    {
        level: 'info',
        path: config.logs.folder + '/atlas.log'
    }
];

config.uploads.folder = '/var/uploaded_files';
config.uploads.baseUrl = 'yamacity.com/files';
config.storefront.baseUrl = 'https://yamacity.com';
config.switchPayments.baseUrl = 'https://api.switchpayments.com/v2';

config.emails.from.name = 'yamacity.com';
config.emails.from.email = 'support@yamacity.com';

// Export
export default config;
