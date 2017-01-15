'use strict';
var Discord = require('discord.js');
var debug = require('debug')('PsyBot');


var FSConfig = require('./lib/fs-config');

class PsyBot {
  constructor(token, options) {
    this.commands = [];

    this.token = token;

    this.config = new FSConfig();

    this.options = options || {};

    // Discord specific settings
    this.options.discord = this.options.discord || {};
    this.options.discord.disableEveryone = this.options.discord.disableEveryone || true;

    this.createClient(this.options.discord);

    this.setupHandlers();
    this.login(token);
  }

  setupHandlers() {
    if (!this.options.disableMessageLogging) {
      this.client.on('message', (message) => {
        if (message.type === 'dm') {
          debug(`(Private) ${message.author.name}: ${message.content}`);
        } else {
          debug(`(- ${message.guild.name} / #${message.channel.name}) ${message.author.username}: ${message.content}`);
        }
      });
    }

    this.client.on('message', (message) => {
      if (message.author.bot) {
        return;
      }

      this.commands.forEach((cmd) => {
        if (message.channel.isPrivate === true && cmd.allowPrivate === false) {
          return;
        }

        this.parseCommand(message, cmd);
      });

    });
  }

  parseCommand(message, cmd) {
    debug('[ParseCommand] handling', cmd);
    var msg = message.content.trim();

    // Must start with the prefix
    // Must be only the prefix if args on
    // Must not be only the prefix with args off
    if (msg.indexOf(cmd.prefix) !== 0 ||
      cmd.args === true && msg === cmd.prefix ||
      cmd.args === false && msg !== cmd.prefix) {
      debug('[ParseCommand] failed matching');
      return;
    }

    var restOfMessage = null;
    if (cmd.args) {
      if (cmd.args !== true) {
        // We need to match the regex
        restOfMessage = msg.substr(cmd.prefix.length).match(cmd.args);
        if (restOfMessage === null) {
          debug("Comand arguements didn't match.");
        }
      } else {
        // return it all, we don't care
        restOfMessage = msg.substr(cmd.prefix.length).trim();
      }
    }

    return cmd.callback(this, message, restOfMessage);
  }

  addCommands(commands) {
    var self = this;
    commands.forEach((cmd) => self.addCommand(self, cmd));
  }

  addCommand(self, cmd) {
    if (cmd.prefix === undefined || cmd.callback === undefined) {
      debug('Invalid Command, the following does not have a command and callback defined', cmd);
      return;
    }


    self.commands.push(cmd);
  }

  createClient(options) {
    this.client = new Discord.Client(options);
    return this.client;
  }

  login(token) {
    this.client.login(token).then(token => {
      debug('Successfully logged in');

      this.client.user.setGame('with Midge\'s mum');
      this.client.user.setUsername('PsyBot')
      .then(user => debug(`Updated username: ${user.username}`))
      .catch(debug);
    })
    .catch(error => debug('There was an error logging in: ' + error));
  }
}

module.exports = PsyBot;
