Node event publisher
===========================

Publish event bindings to redis pubsub, there should be data passed with the events.

**Have events that happen in an app that you might want published to a redis instance?**
*Why redis? Because you can subscribe with multiple clients, being one app can fire events to another app that is running on a python platform for example.*

# Usage

```
var EventEmitter = require('events').EventEmitter,
    EventPub = require('node-event-pub'),
    appEmitter = new EventEmitter();

var eventpub = new EventPub({
  hostname: '127.0.0.1', //Defaults to localhost
  port: 6379, //Defaults to 6379
  emitter: appEmitter, //Emitter instance to listen on
  namespace: 'testing' //The namespace to prepend the events with when published
});

//Add the listener
eventpub.bindEvent('data');

//Emit data
appEmitter.emit('data', 'Just testing'); //published to redis channel 'testing_data'

//Remove the listener
eventpub.unbindEvent('data');
```

# Publish format
- *published to the channel identified by namespace*
- **message is a json string**

### Message format
```
{
  event: /* the event that fired the publish */
  data: /* data that was associated with the event emission */
}
```

# TODO:
- *better tests, async tests complicate the simple test cases*
- *convert it to the event emitter itself, so there isn't need for two objects*
