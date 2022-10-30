const scrollToY = require('scrolltoy')

function ready () {
  const sections = [...document.querySelectorAll('section')]

  if (window.location.hash) {
    const id = window.location.hash.slice(1)
    const active = document.getElementById(id)

    sections.forEach(section => {
      section.style.display = 'none'
    })

    if (active) {
      active.style.display = 'block'
      scrollToY(window, active.offsetTop, 1500)
    }
  }

  document.body.addEventListener('click', event => {
    if (event.target.matches('.up')) {
      scrollToY(window, 0, 1500)
      return
    }

    if (event.target.matches('.link')) {
      sections.forEach(section => {
        section.style.display = 'none'
      })

      const id = event.target.getAttribute('href').slice(1)
      const section = document.getElementById(id)
      section.style.display = 'block'
      scrollToY(window, section.offsetTop, 1500)
    }
  })
}

document.addEventListener('DOMContentLoaded', ready)
