var EventEmitter = require('events').EventEmitter,
    EventPub = require('./lib').Publisher,
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
    namespace = 'testing';

    eventpub = new EventPub({
      redis: redis,
      emitter: appEmitter,
      namespace: namespace
    });

    eventpub.bindEvent(events);
    subscriber.subscribe(namespace);
  });

  it('should publish object correctly', function(done) {
    var data = {
      'foo': 'bar',
      'baz': 1
    };

    subscriber.on('message', function(channel, message) {
      message.should.be.a('string');

      message = JSON.parse(message);

      if(message.event === events[1]) {
        message.should.have.property('event').and.equal(events[1]);

        //Y U NO WORK WITH STRICT EQUALS
        message.should.have.property('data').and.eql(data);
        done();
      }
    });

    appEmitter.emit('object', data);
  });

  it('should publish string correctly', function(done) {
    var data = 'foo bar baz';

    subscriber.on('message', function(channel, message) {
      message.should.be.a('string');

      message = JSON.parse(message);

      if(message.event === events[0]) {
        message.should.have.property('event').and.equal(events[0]);
        message.should.have.property('data').and.equal(data);
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