var redis = require('redis'),
    EventEmitter = require('events').EventEmitter;


var EventPub = module.exports = function(opts, events) {
  var config = opts || {};
  this.bindings = [];

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

  if(config.db) this.redis.select(config.db);
  if(events) EventPub.prototype.bind.call(this, events);

  return this;
};

/*
 * Bind a new event or events to pubsub
 *
 */
EventPub.prototype.bind = function(args) {
  var self = this,
      events = Array.prototype.concat.call(args);

  events.forEach(function(evnt) {
    self.bindings.push({ event: evnt, callback: this });

    //Bind to this.emitter
    self.emitter.on(evnt, function(data) {
      //Send the correct this context to publishEvent
      publishEvent.call(self, evnt, data);
    });
  });
};


/*
 * Unbind args from pubsub
 *
 */
EventPub.prototype.unbind = function(args) {
  var self = this,
      events = Array.prototype.concat.call(args);

  events.forEach(function(evnt) {
    if(self.bindings.indexOf(evnt)) {
      console.log(self.emitter.listeners(evnt));
    }
  });
};


/*
 * Function that is called with apply to publish the data
 * this is the current instance context
 * :event - used as the channel to publish the event on
 * :data - data to send on the channel
 */
function publishEvent(event, data) {
  var redis = this.redis;

  //check for data type?
  redis.publish(event, data);
}