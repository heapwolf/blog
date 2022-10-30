(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"scrolltoy":2}],2:[function(require,module,exports){
var requestFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function requestAnimationFallback (callback) {
      window.setTimeout(callback, 1000 / 60)
    }
})()

function ease (pos) {
  return ((pos /= 0.5) < 1)
    ? (0.5 * Math.pow(pos, 5))
    : (0.5 * (Math.pow((pos - 2), 5) + 2))
}

module.exports = function scrollToY (el, Y, speed) {
  var isWindow = !!el.alert
  var scrollY = isWindow ? el.scrollY : el.scrollTop
  var pos = Math.abs(scrollY - Y)
  var time = Math.max(0.1, Math.min(pos / speed, 0.8))

  let currentTime = 0

  function setY () {
    module.exports.scrolling = true
    currentTime += 1 / 60

    var p = currentTime / time
    var t = ease(p)

    if (p < 1) {
      var y = scrollY + ((Y - scrollY) * t)
      requestFrame(setY)

      if (isWindow) {
        el.scrollTo(0, y)
      } else {
        el.scrollTop = y
      }

      return
    }

    if (isWindow) {
      el.scrollTo(0, Y)
    } else {
      el.scrollTop = Y
    }

    module.exports.scrolling = false
  }
  setY()
}

},{}]},{},[1]);
