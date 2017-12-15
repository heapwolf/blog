if (window.location.hash) {
  var id = window.location.hash.slice(1)
  var active = document.getElementById(id)
  if (active) window.scrollTo(0, active.offsetTop)
}
