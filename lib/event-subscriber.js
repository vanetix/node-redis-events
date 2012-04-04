var redis = require('redis');


var Router = module.exports = function(options, routes) {
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

/*
 * subscribe to namespace and dispatch the event
 * to fn
 * :namespace - the namespace to subscribe to
 * :fn - the callback function for a route
 *       invoked with ()
 */
Router.prototype.add = function(namespace, fn) {
  if(!this.routes.hasOwnProperty(namespace)) {
    this.routes[namespace] = fn;
    this.redis.subscribe(namespace);
  }
  else {
    throw new Error('attempted to add route twice');
  }

  return this;
};

/*
 * Add multiple routes
 * :routes
 * [
 *   {
 *     channel: 'namespace',
 *     fn: callback
 *   }
 * ]
 */
Router.prototype.routes = function(routes) {
  var self = this;

  routes.forEach(function(route) {
    self.add(route);
  });
};

/*
 * internal route dispatcher
 * fn is called with event, data
 */
Router.prototype._dispatch = function(namespace, message) {
  var data = JSON.parse(message);

  if(this.routes.hasOwnProperty(namespace)) {
    this.routes[namespace].call(this, data.event, data.data);
  }
};