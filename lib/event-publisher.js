var redis = require('redis'),
    EventEmitter = require('events').EventEmitter;




var EventPublisher = module.exports = function(opts, events) {
  var config = opts || {};
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


/*
 * Bind a new event or events to pubsub
 *
 */
EventPublisher.prototype.bindEvent = function(args) {
  var self = this,
      events = Array.prototype.concat.call(args);

  events.forEach(function(event) {
    var callback = self._bindCallback(event);

    self.bindings.push({ event: event, callback: callback });

    //Bind to this.emitter
    self.emitter.on(event, callback);
  });
};


/*
 * Unbind args from pubsub
 *
 */
EventPublisher.prototype.unbindEvent = function(args) {
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


/*
 * Returns a new callback function to bind with.
 * This allows us to save a reference to unbind with later.
 */
EventPublisher.prototype._bindCallback = function(event) {
  var self = this;

  return function(data) {

    //Publish the event
    self._publishEvent.call(self, event, data);
  };
};


/*
 * Slice the event off the bindings array
 * :event - the name of the event to find
 */
EventPublisher.prototype._removeBinding = function(event) {
  var i,
      len = this.bindings.length;

  for(i = 0; i < len; i++) {
    if(this.bindings[i].event === event) {
      return this.bindings.slice(i, 1)[0];
    }
  }

  return false;
};


/*
 * Function that is called with apply to publish the data
 * this is the current instance context
 * :event - used as the channel to publish the event on
 * :data - data to send on the channel
 *
 *
 */
EventPublisher.prototype._publishEvent = function(event, data) {
  var obj,
      redis = this.redis,
      channel = this.namespace;

  obj = {
    event: event,
    data: data
  };

  redis.publish(channel, JSON.stringify(obj));
};