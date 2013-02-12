/**
 * Module dependencies
 */

var util = require('util'),
    redis = require('redis'),
    uuid = require('node-uuid'),
    EventEmitter = require('events').EventEmitter;

/**
 * Emitter
 *
 * @param {Object|Array} options
 * @param {Array} events
 */

var Emitter = module.exports = function(options, events) {
  options = options || {};
  options.port = options.port || 6379;
  options.hostname = options.hostname || 'localhost';

  this._uuid = uuid.v1();
  this._subscriptions = [];
  this._namespace = options.namespace || 'default';
  this._publisher = options.redis || redis.createClient(options.port, options.hostname);
  this._subscriber = redis.createClient(options.port, options.hostname);

  this._subscriber.on('message', this._emitRedisEvent.bind(this));

  return this;
};

/**
 * Inherit from `EventEmitter`
 */

util.inherits(Emitter, EventEmitter);

/**
 * Emit `event` that originated from redis
 *
 * @param {String} data
 */

Emitter.prototype._emitRedisEvent = function(channel, message) {
  var data,
      event = channel.replace(/^[A-Za-z0-9\s]+:/, '');

  if(message) {
    data = JSON.parse(message);
  }

  if(data.uuid && data.uuid !== this._uuid) {
    EventEmitter.prototype.emit.call(this, event, data.payload);
  }
};

/**
 * Emit `event`
 *
 * @param {String} event
 * @param {String|Array|Object} data
 */

Emitter.prototype.emit = function(event, data) {
  var obj,
      channel = this._namespace + ':' + event;

  obj = {
    uuid: this._uuid,
    payload: data
  };

  this._publisher.publish(channel, JSON.stringify(obj));
  EventEmitter.prototype.emit.call(this, event, data);
};

/**
 * Add listener for `event`
 * 
 * @param {String} event
 * @param {Function} callback
 */

Emitter.prototype.addListener = function(event, callback) {
  var channel = this._namespace + ':' + event;

  if(typeof callback !== 'function') {
    throw new Error('Invalid listener callback');
  }

  if(!~this._subscriptions.indexOf(channel)) {
    this._subscriber.subscribe(channel);
  }

  this._subscriptions.push(channel);
  EventEmitter.prototype.addListener.call(this, event, callback);
};

Emitter.prototype.on = Emitter.prototype.addListener;

/**
 * Remove unbind and unsubscribe from `event`
 *
 * @param {String} event
 */

Emitter.prototype.removeListener = function(event, callback) {
  var channel = this._namespace + ':' + event;
  
  if(~this._subscriptions.indexOf(channel)) {
    this._subscriptions.splice(this._subscriptions.indexOf(channel), 1);
  }
  
  // If that was the last listener unsub from the channel
  if(!~this._subscriptions.indexOf(channel)) {
    this._subscriber.unsubscribe(channel);
  }

  EventEmitter.prototype.removeListener.call(this, event, callback);
};

Emitter.prototype.off = Emitter.prototype.removeListener;

/**
 * Remove all listeners on `event`
 *
 * @param {String} event
 */

Emitter.prototype.removeAllListeners = function(event) {
  if(event) {
    var channel = this._namespace + ':' + event;

    while(~this._subscriptions.indexOf(channel)) {
      this._subscriptions.splice(this._subscriptions.indexOf(channel), 1);
    }

    this._subscriber.unsubscribe(channel);
  } else {
    this._subscriber.unsubscribe.apply(this._subscriber, this._subscriptions);
    this._subscriptions = [];
  }

  EventEmitter.prototype.removeAllListeners.call(this, event);
};