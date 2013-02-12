# Node event publisher
Publish event bindings to redis pubsub, there should be data passed with the events.

**Have events that happen in an app that you might want published to a redis instance?**
*Why redis? Because you can subscribe with multiple clients, being one app can fire events to another app that is running on a python platform for example.*


## Usage
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


## TODO:
- *better tests, async tests complicate the simple test cases*
- *convert it to the event emitter itself, so there isn't need for two objects*


## Release history
- 0.2.1 - *New method of adding listeners*
- 0.0.1 - *Initial release*


## License (MIT)
Copyright (c) 2013 Matt McFarland

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
