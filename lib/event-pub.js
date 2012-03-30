var redis = require('redis'),
    EventEmitter = require('events').EventEmitter;


var EventPub = module.exports = function(opts, events) {
  var config = opts || {};
  this.bindings = [];
  this.namespace = config.namespace || null;

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
EventPub.prototype.bindEvent = function(args) {
  var self = this,
      events = Array.prototype.concat.call(args);

  events.forEach(function(evnt) {
    var callback = self._bindCallback(evnt);

    self.bindings.push({ event: evnt, callback: callback });

    //Bind to this.emitter
    self.emitter.on(evnt, callback);
  });
};

/*
 * Unbind args from pubsub
 *
 */
EventPub.prototype.unbindEvent = function(args) {
  var self = this,
      events = Array.prototype.concat.call(args);

  events.forEach(function(evnt) {
    var binding = self._sliceBinding(evnt);

    //Remote the listener
    if(binding) {
      self.emitter.removeListener(evnt, binding.callback);
    }
  });
};


/*
 * Returns a new callback function to bind
 */
EventPub.prototype._bindCallback = function(event) {
  var self = this;

  return function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(event);

    self._publishEvent.apply(self, args);
  };
};

/*
 * Slice the event off the bindings array
 * :event - the name of the event to find
 */
EventPub.prototype._sliceBinding = function(evnt) {
  var i,
      len = this.bindings.length;

  for(i = 0; i < len; i++) {
    if(this.bindings[i].event === evnt) {
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
 */
EventPub.prototype._publishEvent = function() {
  var redis = this.redis,
      args = Array.prototype.slice.call(arguments),
      event = args.shift(),
      channel = this.namespace ? this.namespace + event : event;

  //There should always be an event name
  if(!event) {
    throw new Error('Attempted to publish empty event');
  }
  else {
    //Reduce the data with the event trigger to a string of data
    var data = args.reduce(function(prev, arg) {
      var ret;

      switch(typeof(arg)) {
        case 'string':
          ret = arg;
          break;
        case 'object':
          ret = JSON.stringify(arg);
          break;
        default:
          //Do nothing?
      }
      return prev ? prev + ret : ret;
    }, '');

    redis.publish(channel, data);
  }
};