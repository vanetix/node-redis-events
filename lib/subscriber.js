/**
 * Module dependencies
 */

var redis = require('redis');

/**
 * Subscriber class
 *
 * @param {Object} options
 * @param {Array} routes
 */

var Subscriber = module.exports = function(options, routes) {
  options = options || {};
  this.routes = routes || {};

  if(options.redis) this.redis = options.redis;
  if(options.hostname) {
    options.port = options.port || '6379';
    this.redis = redis.createClient(options.port, options.hostname);
  }

  if(!this.redis) throw new Error('redis instance is needed');

  //Dispatch routes on message
  var self = this;
  this.redis.on('message', function(channel, message) {
    self._dispatch(channel, message);
  });

  return this;
};

/**
 * Subscribe `fn` to an event
 *
 * @param {String} namespace
 * @param {Function} fn
 */

Subscriber.prototype.add = function(namespace, fn) {
  if(!this.routes.hasOwnProperty(namespace)) {
    this.routes[namespace] = fn;
    this.redis.subscribe(namespace);
  }
  else {
    throw new Error('attempted to add route twice');
  }

  return this;
};

/**
 * Add an array of route objects
 *
 * @param {Array} routes
 */

Subscriber.prototype.routes = function(routes) {
  var self = this;

  routes.forEach(function(route) {
    self.add(route);
  });
};

/**
 * Dispatch the event
 *
 * @param {String} namespace
 * @param {String} message
 */

Subscriber.prototype._dispatch = function(namespace, message) {
  var data = JSON.parse(message);

  if(this.routes.hasOwnProperty(namespace)) {
    this.routes[namespace].call(this, data.event, data.data);
  }
};