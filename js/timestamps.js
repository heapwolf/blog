document.addEventListener('DOMContentLoaded', () => {
  const timelineA = document.getElementById('timeline-node-a')
  timelineA.dataset.name = 'node a'

  const timelineB = document.getElementById('timeline-node-b')
  timelineB.dataset.name = 'node b'

  let clockA = 0
  let clockB = 0

  function reset () {
    clockA = 0
    clockB = 0
    while (timelineA.firstChild) timelineA.firstChild.remove()
    while (timelineB.firstChild) timelineB.firstChild.remove()
  }

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

    event.style.left = `${(clock / 25) * 100}%`
    event.appendChild(tooltip)

    timeline.appendChild(event)
    setTimeout(() => {
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

  links.addEventListener('click', e => {
    e.preventDefault()

    switch (e.target.dataset.name) {
      case 'a':
        nodeA()
        break
      case 'b':
        nodeB()
        break
    }
  })
})
