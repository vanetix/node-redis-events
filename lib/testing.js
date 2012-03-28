var events = require('events'),
    pubsub = require('./events-pubsub'),
    emitter = new events.EventEmitter();


emitter.on('testing', function() {
  //DO NOTHING
  return;
});

var pubsub = new pubsub({
  hostname: '127.0.0.1',
  emitter: emitter
});

pubsub.bind([ 'testing', 'another' ]);


emitter.emit('testing');
emitter.emit('another');
emitter.emit('unbound');

console.log(pubsub);