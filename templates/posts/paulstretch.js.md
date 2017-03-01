{{{
  "title" : "Paulstretch algorithm with Web Audio API, and how to delegate audio processing to web workers",
  "tags" : [ "Web Audio API", "experiment"],
  "category": "experiments",
  "date" : "17/11/2014"
}}}

Just published an implementation of PaulStretch in JavaScript which I made about a year ago. The [repository is here](https://github.com/sebpiq/paulstretch.js) and in addition there is a demo [which allows you to create nice drones from SoundCloud tracks](http://sebpiq.github.io/paulstretch.js/examples/stretched-and-droned/dist/index.html). The following post is a more general tutorial on how to process audio live with web workers, and it uses **paulstretch.js** as an example.

<!--more-->

**paulstretch.js** can be used in Node.js and in the browser. Unlike the original PaulStretch implementations, it is designed for allowing the user to change the stretch ratio at any time.

Let's go over its API, in order to make the following example clearer.

Note that in the following, `blockOut` and `blockIn` are just arrays representing channels data. For example a stereo block of 10 frames is represented by `[new Float32Array(10), new Float32Array(10)]`.

```javascript
// Creates a PaulStretch instance. Typical `winSize` is 4096.
// The created instance has 2 queues. One 'write queue' with raw input frames,
// one 'read queue' with processed frames.
var paulstretch = new PaulStretch(numberOfChannels, initialStretchRatio, winSize)

// Writes a block to the 'write queue'.
paulstretch.write(blockIn)

// Processes the data from the 'write queue' and add it to the 'read queue'.
// It also returns the number of frames that were processed.
// If there is not enough data to process, 0 is returned.
paulstretch.process() 

// Reads the processed data from the 'read queue' to `blockOut`.
// The amount of frames read depends on the length of `blockOut`.
// If there is not enough frames to fill `blockOut`, `null` is returned.
paulstretch.read(blockOut)

// Returns the number of processed frames in the 'read queue'.
paulstretch.readQueueLength()

// Set the time stretch ratio. Note that frames in the `readQueue` won't be affected.
paulstretch.setRatio(newRatio)
```


The web audio API code
========================

As all the processing will happen in a worker, the only thing we want from web audio API is to read incoming blocks of audio and send them for processing to our worker.

So we create a `ScriptProcessorNode`, with an `onaudioprocess` method that :

1. reads incoming blocks of audio, writes them to a queue `blocksIn` which will be sent to the worker.
2. plays back audio from another queue `blocksOut` which contains processed audio blocks received from the worker.

```javascript
var blocksIn = []
  , blocksOut = []

paulstretchNode.onaudioprocess = function(event) {
  var ch, block = []

  for (ch = 0; ch < numberOfChannels; ch++)
    block.push(event.inputBuffer.getChannelData(ch))
  blocksIn.push(block)
  
  if (blocksOut.length) {
    block = blocksOut.shift()
    for (ch = 0; ch < numberOfChannels; ch++)
      event.outputBuffer.getChannelData(ch).set(block[ch])
  }
}
```


The worker file
==================

Here is a template of our worker file with a message handler for receiving commands from the main thread.

```javascript
onmessage = function (event) {
  switch ( event.data.type ) {
    case 'read':
      break
    case 'write':
      break
  }
}
```

In order to keep the audio responsive, and be able to change the stretch ratio live, we need to process audio only at the last moment. This will be handled in the `'read'` case.

Writing is trivial ... we just take the audio as it comes :

```javascript
  case 'write':
    paulStretch.write(event.data.data)
    break
  }
```

Reading is more tricky. We need to make sure that we have enough processed audio to meet the demand. and not starve the `ScriptProcessorNode`, which would result in ugly glitches of agony. For this, we will simply buffer the processed audio, making sure that we always have a batch of `batchSize` blocks ready to be sent. Of course, the bigger the buffer (i.e. the bigger batch size), the less likely you are to get glitches. Unfortunately, the bigger the buffer, the bigger the latency between a change of stretch ratio and an audible result. 

```javascript
  case 'read':
    var i

    // If there is at least `batchSize` blocks of audio ready to be sent in the 'read queue',
    // we send the whole batch block by block.
    if (Math.floor(paulStretch.readQueueLength() / blockSize) >= batchSize) {
      for (i = 0; i < batchSize; i++) paulStretch.read(blocksOut[i])
      postMessage({ type: 'read', data: blocksOut })
    }
 
    // Fill-up the 'read queue' to at least `batchSize` blocks
    while ((paulStretch.readQueueLength() < (batchSize * blockSize)) 
      && (paulStretch.process() !== 0)) paulStretch.readQueueLength()

    break
```

Complete worker code can be found [here](https://github.com/sebpiq/paulstretch.js/blob/master/examples/simple/js/paulstretch-worker.js).


Communication with the worker
================================

Now that all the parts are there, we will need to wire them up.

For this we will run in the main thread a function with `setInterval` that will periodically communicate with the worker : sending raw audio, and receiving processed audio.

Once again, for raw audio there is no problem, as we will send the blocks as they comes ... but for processed audio we will apply a similar technique as in the worker and use a buffer that should always contain at least `batchSize` blocks. Therefore, we check the state of our buffer `blocksOut` at each interval, and request new data from the worker only when the buffer runs low. 

```javascript
setInterval(function() {
  if (blocksIn.length)
    paulstretchWorker.postMessage({ type: 'write', data: blocksIn.shift() })

  if (blocksOut.length < batchSize) 
    paulstretchWorker.postMessage({ type: 'read' })
}, 100)
```

That's all there is to it! With this simple technique, you can use in web audio API processes that are too heavy to run in the main thread.

Let's recap :

**In the main thread** 

```javascript

var blocksIn = []
  , blocksOut = []

paulstretchNode.onaudioprocess = function(event) {
  var ch, block = []

  for (ch = 0; ch < numberOfChannels; ch++)
    block.push(event.inputBuffer.getChannelData(ch))
  blocksIn.push(block)
  
  if (blocksOut.length) {
    block = blocksOut.shift()
    for (ch = 0; ch < numberOfChannels; ch++)
      event.outputBuffer.getChannelData(ch).set(block[ch])
  }
}

setInterval(function() {
  if (blocksIn.length)
    paulstretchWorker.postMessage({ type: 'write', data: blocksIn.shift() })

  if (blocksOut.length < batchSize) 
    paulstretchWorker.postMessage({ type: 'read' })
}, 100)
```

**In the web worker**

```javascript
onmessage = function (event) {
  switch ( event.data.type ) {
    case 'read':
      var i

      // Send audio from the buffer if there is at least `batchSize` blocks
      if (Math.floor(paulStretch.readQueueLength() / blockSize) >= batchSize) {
        for (i = 0; i < batchSize; i++) paulStretch.read(blocksOut[i])
        postMessage({ type: 'read', data: blocksOut })
      }
   
      // Fill-up the buffers to at least `batchSize` blocks
      while ((paulStretch.readQueueLength() < (batchSize * blockSize)) 
        && (paulStretch.process() !== 0)) paulStretch.readQueueLength()
      break

    case 'write':
      paulStretch.write(event.data.data)
      break
    }
  }
}
```

[The complete code of the example can be found here](https://github.com/sebpiq/paulstretch.js/tree/master/examples/simple).