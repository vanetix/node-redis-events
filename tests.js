var EventEmitter = require('events').EventEmitter,
    EventPub = require('./lib/event-pub'),
    appEmitter = new EventEmitter();

var eventpub = new EventPub({
  hostname: '127.0.0.1', //Defaults to localhost
  port: 6379, //Defaults to 6379
  emitter: appEmitter, //Emitter instance to listen on
  namespace: 'testing_' //The namespace to prepend the events with when published
});

//Add the listener
eventpub.bindEvent('data');

//Emit data
appEmitter.emit('data', 'Just testing'); //published to redis channel 'testing_data'

//Remove the listener
eventpub.unbindEvent('data');