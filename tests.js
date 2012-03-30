var EventEmitter = require('events').EventEmitter,
    EventPub = require('./lib/event-pub'),
    appEmitter = new EventEmitter(),
    should = require('should'),
    redis = require('redis').createClient(),
    subscriber = require('redis').createClient();


describe('Published data', function() {
  var eventpub,
      namespace,
      events;

  before(function() {
    events = ['string', 'object'];
    namespace = 'testing_';

    eventpub = new EventPub({
      redis: redis,
      emitter: appEmitter,
      namespace: namespace
    });

    eventpub.bindEvent(events);
    subscriber.subscribe(namespace + events[0]);
    subscriber.subscribe(namespace + events[1]);
  });

  it('should publish object correctly', function(done) {
    var data = {
      'foo': 'bar',
      'baz': 1
    };

    subscriber.on('message', function(channel, message) {
      if(channel === namespace + events[1]) {
        message.should.equal(JSON.stringify(data));
        done();
      }
    });

    appEmitter.emit('object', data);
  });

  it('should publish string correctly', function(done) {
    var data = 'foo bar baz';

    subscriber.on('message', function(channel, message) {
      if(channel === namespace + events[0]) {
        message.should.equal(data);
        done();
      }
    });

    appEmitter.emit('string', data);
  });

  it('should unbind events', function() {
    eventpub.unbindEvent(events[0]);
    appEmitter.listeners(events[0]).should.have.lengthOf(0);
  });

});