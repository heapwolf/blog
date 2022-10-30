# vector clocks

In the previous post, I wrote about how *Lamport Timestamps* (aka Logical
Clocks) can help determine the order of events in a distributed system.

## problem
Logical clocks only offer "Partial Ordering", because they can tell us the
order of a single event, but not the __total ordering__ of events or why
a system arrived at its state.

## solutions
*Vector Clocks* build on the idea of Logical Clocks to help track
[causality][ca] in a distributed system.

Here is an example vector clock in a network where there are three
participating nodes...

```js
{ alice: 0, bob: 1, carol: 0 }
```

To set up a node we will give it an id and an in memory object to
store some data.

```js
const myId = 'alice'
const data = {}
```

### sending messages
When a node writes some data, it increments its own logical clock in
the vector and includes it as a property of a message that it will
attempt to send. We also add the value as a property of the message.

```js
function write (key, value) {
  if (!data[key]) {
    data[key] = { clock: { [myId]: 0 } }
  }

  data[key].clock[myId] += 1 
  data[key].value = [value]

  send(key, data[key])
}
```

> In this case we made the __value__ property an array. This is because we
> must anticipate the possibility of __concurrent messages__ &mdash; that is,
> a message was received where two nodes have a logical clock with the same
> count.
>
> In this case we can push the new value onto the array and allow the the
> conflict to be resolved somehow (we'll discuss this more later).

### receiving messages
When a node receives a message it increments its own Logical Clock in
its local copy of the vector.

Then for each node in the message's vector, it compares the local
clock count (if there is one) to the clock count in the received
message, taking the max of the numbers.


```js
const max = arr => Math.max.apply(null, Object.values(arr))

function receive (message) {
  const key = message.key

  //
  // If this is new data, there is no need to compare anything.
  // we can store it locally and return early from the function.
  //
  if (!data[key]) {
    data[key] = message
    data.clock[myId] = max(message.clock) + 1
    return
  }

  //
  // We have received the message, update our clock
  //
  data[key].clock[myId] += 1

  const localClock = data[key].clock
  const messageClock = message.clock

  //
  // For each node in the vector of the message
  //
  for (const id in Object.keys(messageClock)) {
    const a = localClock[id] || 0
    const b = messageClock[id]

    const isConcurrent = a === b

    if (isConcurrent) {
      data[key].conflict = true
      data[key].value.push(message.value)
      continue
    }

    const happenedBefore = a < b

    if (happenedBefore) {
      data[key].value = [message.value]
    }

    localClock[id] = Math.max(a, b)
  }
}
```

### handling concurrent messages
Two messages that are received at the same time and have the same logical clock
count are "concurrent".

To understand what to do with this type of data, we need to create a __resolution
function__. This function may be the only way to determine what data is either a
descendant or which data comes-before.

1. Reject the data and send it back to the clients asking for it to be resolved.
This might mean asking them to manually merge or discard some of the data.

2. __Last-Writer-Wins__ uses time-based timestamps. If you consider clock-drift
(mentioned in the first post), there is a high probability of losing data with
this strategy.

### research timeline
When discussing Vector Clocks we should consider some other closely related
research...

<div class="clock-timeline">
  <a href="https://amturing.acm.org/p558-lamport.pdf" class="item">
    <span class="title">Lamport Timestamp</span>
    <span class="year">1978</span>
  </a>
  <a href="https://zoo.cs.yale.edu/classes/cs422/2013/bib/parker83detection.pdf" class="item">
    <span class="title">Version Vector</span>
    <span class="year">1983</span>
  </a>
  <a href="https://zoo.cs.yale.edu/classes/cs426/2012/lab/bib/fidge88timestamps.pdf" class="item">
    <span class="title">Vector Clock</span>
    <span class="year">1988</span>
  </a>
  <a href="https://www.researchgate.net/publication/221233664_Bounded_Version_Vectors" class="item">
    <span class="title">Bound Version Vector</span>
    <span class="year">2004</span>
  </a>
  <a href="http://gsd.di.uminho.pt/members/cbm/ps/itc2008.pdf" class="item">
    <span class="title">Interval Tree Clock</span>
    <span class="year">2008</span>
  </a>
  <a href="https://arxiv.org/pdf/1011.5808.pdf" class="item">
    <span class="title">Dotted Version Vectors</span>
    <span class="year">2010</span>
  </a>
</div>

*Version Vectors* also build on the idea of Lamport Timestamps, but are
specifically meant to track changes to data in distributed systems. They
are also the basis for [optimistic replication][or].

### disadvantages
Each message sent by a node contains a vector clock that has all the node
names (and their corresponding clock counts) who want to write to the same
field of data.

This can be a problem since a data structure that can grow to an unbound size
can be a problem in larger networks with more frequent writes. Strategies for
dealing with this are often based on what suits your use-cases best, for
example, two possible solutions are...

1. If a network has a finite number of nodes, a message that has reached
   all nodes can be considered "complete", could be marked as such and have
   it's historic information removed.

2. If a network has an acceptable threshold of nodes that once a message has
   reached, the message can be considered complete and can then be cleaned up.

[0]:https://en.wikipedia.org/wiki/Happened-before
[or]:https://en.wikipedia.org/wiki/Optimistic_replication
[ca]:https://en.wikipedia.org/wiki/Causality

[00]:https://amturing.acm.org/p558-lamport.pdf
[01]:https://zoo.cs.yale.edu/classes/cs422/2013/bib/parker83detection.pdf
[02]:https://zoo.cs.yale.edu/classes/cs426/2012/lab/bib/fidge88timestamps.pdf
[03]:https://www.researchgate.net/publication/221233664_Bounded_Version_Vectors
[04]:http://gsd.di.uminho.pt/members/cbm/ps/itc2008.pdf
