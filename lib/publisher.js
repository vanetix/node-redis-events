/**
 * Module dependencies
 */

var redis = require('redis'),
    EventEmitter = require('events').EventEmitter;

/**
 * Publisher
 *
 * @param {Object} options
 * @param {Array} events
 */

var Publisher = module.exports = function(options, events) {
  var config = options || {};
  this.bindings = [];
  this.namespace = config.namespace || 'default';

  if(config.emitter) {
    this.emitter = config.emitter;
  }
  else {
    throw new Error('Emitter must be passed');
  }

  if(config.redis) {
    this.redis = config.redis;
  }
  else {
    config.port = config.port || 6379;
    this.redis = redis.createClient(config.port, config.hostname);
  }

  if(events) this.bindEvent(events);

  return this;
};

/**
 * Bind the given events in `args`
 *
 * @param {Array|String} args
 */

Publisher.prototype.bindEvent = function(args) {
  var self = this,
      events = Array.prototype.concat.call(args);

  events.forEach(function(event) {
    var callback = self._bindCallback(event);

    self.bindings.push({ event: event, callback: callback });

    //Bind to this.emitter
    self.emitter.on(event, callback);
  });
};

/**
 * Unbind the events in `args`
 *
 * @param {Array|String} args
 */

Publisher.prototype.unbindEvent = function(args) {
  var self = this,
      events = Array.prototype.concat.call(args);

  events.forEach(function(evnt) {
    var binding = self._removeBinding(evnt);

    //Remote the listener
    if(binding) {
      self.emitter.removeListener(evnt, binding.callback);
    }
  });
};

/**
 * Binds the callback to the `data` and `event`
 *
 * @param {String} event
 * @return {Function}
 */

Publisher.prototype._bindCallback = function(event) {
  var self = this;

  return function(data) {

    //Publish the event
    self._publishEvent.call(self, event, data);
  };
};

/**
 * Unbind an event from the publisher
 *
 * @param {String} event
 */

Publisher.prototype._removeBinding = function(event) {
  var i,
      len = this.bindings.length;

  for(i = 0; i < len; i++) {
    if(this.bindings[i].event === event) {
      return this.bindings.slice(i, 1)[0];
    }
  }

  return false;
};

/**
 * Actually publish the event to redis
 *
 * @param {String} event
 * @param {String} data
 */

Publisher.prototype._publishEvent = function(event, data) {
  var obj,
      redis = this.redis,
      channel = this.namespace;

  obj = {
    event: event,
    data: data
  };

  redis.publish(channel, JSON.stringify(obj));
};