var xhr = require('xhr')
var marked = require('marked')
var domready = require('domready')
var config = require('./config')

marked.setOptions({
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value
  }
})

var opts = {
  headers: {
    'user-agent': 'javascript',
    'Accept': 'application/vnd.github.squirrel-girl-preview'
  },
  withCredentials: false
}

var src = ['repos', config.user, config.repo, 'issues'].join('/')

config.authors = config.authors.map(function(author) {
  return author.toLowerCase()
})

function update() {
  xhr('https://api.github.com/' + src, opts, function(err, data) {
    if (err) {
      return error(err)
    }

    domready(function() {
      render(JSON.parse(data.body))
      localStorage.mtime = Date.now()
      localStorage.data = data.body
    })
  })
}

if (!localStorage.data) {
  update()
} else {

  var HR = 60 * 60 * 1000
  var expired = localStorage.mtime &&
    ((new Date) - new Date(parseInt(localStorage.mtime, 10)) > HR)

  if (expired) {
    update()
  } else {
    render(JSON.parse(localStorage.data))
  }
}

function error() {
  var error = document.getElementById('error')
  error.style.display = 'block'
}

function render(data) {

  var posts = document.getElementById('posts')
  var post_template = document.createElement('div')
  post_template.innerHTML = document.getElementById('post').textContent

  data.map(function(d) {
    if (config.authors.indexOf(d.user.login.toLowerCase()) === -1) {
      return
    }

    var post = post_template.cloneNode(true)
    post.querySelector('.post').setAttribute('data-post', d.number)
    var body = post.querySelector('.body')

    post.querySelector('.title').textContent = d.title
    post.querySelector('.comments').textContent = d.comments

    post.querySelector('.username').textContent = d.user.login
    post.querySelector('.avatar').src = d.user.avatar_url
    post.querySelector('.comments_url').src = d.comments_url

    var created = new Date(Date.parse(d.created_at)).toDateString()
    var updated = new Date(Date.parse(d.updated_at)).toDateString()

    post.querySelector('.created_at').textContent = created

    //if (created !== updated) {
      post.querySelector('.updated_at').textContent = updated
    //}

    body.innerHTML = marked(d.body)

    var labels = post.querySelector('.labels')
    var reactions = post.querySelector('.reactions')

    if (d.reactions) {
      Object.keys(d.reactions).map(function(key) {
        if (key === 'url') return

        var reaction = document.createElement('div')
        reaction.style.backgroundImage = 'url("/images/' + key + '.svg")'
        reaction.setAttribute('data-count', d.reactions[key])
        reactions.appendChild(reaction)
      })
    }

    d.labels.map(function(data) {
      var label = document.createElement('span')
      label.textContent = data.name
      if (config.coloredLabels) {
        label.style.backgroundColor = '#' + data.color
      }
      labels.appendChild(label)
    })

    posts.appendChild(post.firstElementChild)
  })
}
