var Emitter = require('../'),
    redis = require('redis').createClient();

describe('Emitter', function() {
  describe('locally', function() {
    var emitter;

    before(function() {
      emitter = new Emitter({redis: redis});
    });

    it('should only fire once', function(done) {
      // mocha will fire an error if `done` invoked < 1
      emitter.on('fire', function() {
        return done();
      });

      emitter.emit('fire');
    });

    it('should remove events', function() {
      emitter.removeAllListeners('fire');
      emitter._subscriptions.should.have.length(0);
    });
  });

  describe('redis instance', function() {
    var emitter;

    before(function() {
      emitter = new Emitter();
    });

    it('should get data from emitter', function(done) {
      redis.subscribe('default:data', function() {
        done();
      });

      emitter.emit('data');
    });
  });

  describe('with multiple instances', function() {
    var emitter_1, emitter_2;

    before(function() {
      emitter_1 = new Emitter();
      emitter_2 = new Emitter();
    });

    it('should talk to another', function(done) {
      emitter_1.on('event 1', function(data) {
        data.should.equal('data here');
        done();
      });
      
      // Slow down the event firing
      setTimeout(function() {
        emitter_2.emit('event 1', 'data here');
      }, 10);
    });
  });
});