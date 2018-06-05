'use strict';
var debug = require('debug')('PsyBot');

let ENABLED = false;

if(process.env.CONSUMER_KEY
 && process.env.CONSUMER_SECRET
 && process.env.ACCESS_TOKEN_KEY
 && process.env.ACCESS_TOKEN_SECRET) {
    ENABLED = true;
 } else {
    debug('Twitter env vars are not set, disabling');
 }

/* Setup Twitter */
let Twitter = require('twitter');
let twitter = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

module.exports = {
    enabled: ENABLED,
    prefix: '!tweet',
    args: true,
    requiredPermissions: ['MANAGE_ROLES_OR_PERMISSIONS'],
    requiredRole: 'twitter',
    callback: (bot, message, update) => {
        twitter.post('statuses/update', {status: update},  function(error, tweet) {
            debug(error, tweet);
            if(error) {
                return;
            }
            bot.reply(message, 'Tweet sent');
        });
    }
}