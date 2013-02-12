# Node event publisher
*Publish events between application instances using redis pub/sub* ***If an event is fired locally, the event is only fired once.***

## Usage
```
var Emitter = require('node-redis-events');

var emitter = new Emitter({
  namespace: 'App'
});

// broadcasted to redis channel `App:data`
emitter.emit('data'); 

// Add a listener and subscribe to channel `App:data`
emitter.on('data', function(work) {
  //do work on `work`
});

// Listener is only called once, but is published to redis, which means another emitter could bind to `data`
emitter.emit('data', 'some work');
```

## TODO:
- More test coveragee

## Release history
- 0.9.0 - *Updated to an actual emitter*

## License (MIT)
Copyright (c) 2013 Matt McFarland

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
