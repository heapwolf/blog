# illustrated lamport timestamp

## problem
With the client-server model, you can easily determine the order of
events in a system because they are all maintained by a single source.
This is critical in, for example a chat application.

But with the distributed model, how do we know if an event happened
before another? How can we thread together datasets from different
sources in the correct order?

## solution
A *Lamport Timestamp* is one solution to determine the order of events
in a distributed system. Although it may not solve all problems in this
problem space, it is a useful primitive that we will explore.

### Clocks vs. Logical Clocks
Why don't we use regular time stamps? Most clocks count time at different rates
and experience failures that require resynchronization. This means they are
reliably unreliable for determining the order of events.

Lamport Timestamps use a *Logical Clock* to keep track of the order of events
on each node. A logical clock is not a clock that keeps track of the time, it's
a [monotonically increasing][1] counter. So, when a node in a network receives a message, it
re-synchronizes its counter (its clock) with the node that sent the message.

### Example
Node `A` increments its clock before each event that hapens. An event is
something meaningful, like when it creates some data. When node `A`
eventually sends its payload over the network, it will include the current
value of its clock.

```js
let clock = 0

//
// A thread-safe, monotonically increasing function.
//
function createTimeStamp () {
  clock += 1
  return clock 
}

function doSomething (data) {
  //
  // Do something with some data.
  //
  return {
    data,
    clock: createTimeStamp()
  }
}

//
// Eventually send the data to the network.
//
sendToNetworkQueue(doSomething({ ... }))
```

When node `B` receives a message from node `A`, it will decide how to set
its own clock. If the clock value in the message is greater than its own
value, it will use the value in the message. Otherwise it will use its own
value. In either case, it will also increment its own clock by `1`.

```js
let clock = 0

//
// Eventually receive some data from the network.
//
receiveFromNetworkQueue (message) {
  clock = Math.max(message.clock, clock) + 1
}
```

Here we semi-randomly fail to always tell the other node about the event that
happened, illustrating what happens when a node is eventually synchronized.

<div id="lamport-timestamp">
  <div id="timeline-node-a" class="timeline"></div>
  <div id="timeline-node-b" class="timeline"></div>
</div>

<div id="node-event-links">
  <div data-name="a">Fire event on node A</div>
  <div data-name="b">Fire event on node B</div>
</div>

This may not be the correct primitive for all your use cases. For example,
Lamport Timestamps don't express causality, meaning, the *reason* why one
event happened before another isn't in scope of this soluton, but that is
something that can be achieved using a [Vector Clock][2].

<script>
  
  function ready () {
    const timelineA = document.getElementById('timeline-node-a')
    timelineA.dataset.name = "node a"

    const timelineB = document.getElementById('timeline-node-b')
    timelineB.dataset.name = "node b"

    let clockA = 0
    let clockB = 0

    function reset () {
      clockA = 0
      clockB = 0
      while(timelineA.firstChild) timelineA.firstChild.remove()
      while(timelineB.firstChild) timelineB.firstChild.remove()
    }

    let timer = null

    function createEvent (timeline, clock) {
      if (clock === 25) {
        clock = 1
        reset()
      }

      [...timeline.querySelectorAll('.clock')].map(el => {
        el.classList.remove('show')
      })

      const event = document.createElement('div')
      event.classList.add('event')

      const tooltip = document.createElement('div')
      tooltip.className = 'clock show'
      tooltip.textContent = `Clock = ${clock}`

      event.style.left = `${clock * 25}px`
      event.appendChild(tooltip)

      timeline.appendChild(event)
      timer = setTimeout(() => {
        tooltip.classList.remove('show')
      }, 2048)
    }

    function nodeA (n) {
      if (n > 0) {
        clockA = Math.max(n, clockA) + 1
      } else {
        clockA++

        if (Math.floor(Math.random() * 100) % 2 === 0) {
          nodeB(clockA)
        }
      }
      createEvent(timelineA, clockA)
    }

    function nodeB (n) {
      if (n > 0) {
        clockB = Math.max(n, clockB) + 1
      } else {
        clockB++

        if (Math.floor(Math.random() * 100) % 2 === 0) {
          nodeA(clockB)
        }
      }

      createEvent(timelineB, clockB)
    }

    const links = document.getElementById('node-event-links')

    links.addEventListener('click', ({ target }) => {
      switch (target.dataset.name) {
        case 'a':
          nodeA()
          break;
        case 'b':
          nodeB()
          break;
      }
    })
  }
 
  document.addEventListener('DOMContentLoaded', ready)

</script>

<br/>

Special thanks to [Fedor Indutny][3] and [Feross Aboukhadijeh][4] for reviewing
this post. &hearts;

[1]:https://en.wikipedia.org/wiki/Monotonic_function
[2]:https://en.wikipedia.org/wiki/Vector_clock
[3]:https://twitter.com/indutny
[4]:https://twitter.com/feross
