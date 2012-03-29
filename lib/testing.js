var events = require('events'),
    pubsub = require('./event-pub'),
    emitter = new events.EventEmitter();

emitter.on('testing', function() {});

var pubsub = new pubsub({
  hostname: '127.0.0.1',
  emitter: emitter
});

pubsub.bindEvent([ 'testing', 'another' ]);


emitter.emit('testing');
emitter.emit('another');
emitter.emit('unbound');


console.log(emitter);

pubsub.unbindEvent('testing');



console.log(emitter);