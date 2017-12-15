const marked = require('marked')
const fs = require('fs')
const hl = require('highlight.js')
const { parse } = require('stream-body')
const { request } = require('https')

const config = require('../config')

const opts = {
  hostname: 'api.github.com',
  path: `/repos/${config.user}/${config.repo}/issues`,
  headers: {
    'User-Agent': 'node',
    'Content-Type': 'application/json'
  }
}

const update = {
  then: next => request(opts, r => {
    parse(r, (err, data) => {
      if (err) return next([err])
      return next([null, data])
    })
  }).end()
}

const authors = config.authors.map(s => s.toLowerCase())

const createPost = post => `
  <div class="post" id="${post.id}">
    <a class="link" href="${post.slug}">
      <div class="labels">${post.labels}</div>
      <h1 class="title">${post.title}</h1>
    </a>
    <div class="body">
      ${post.body}
    </div>
  </div>
`

marked.setOptions({
  highlight: code => {
    return hl.highlightAuto(code).value
  }
})

async function main () {
  let [err, articles] = await update
  if (err) return console.error(err)

  articles = articles.map(d => {
    const login = d.user.login.toLowerCase()

    if (!authors.includes(login)) return

    d.id = d.title.replace(/ /g, '-')
    d.slug = '#' + d.id
    d.body = marked(d.body)

    d.labels = d.labels.map(data => {
      return `<span>${data.name}</span>`
    }).join(' ')

    return createPost(d)
  })

  const root = `${__dirname}/..`
  const src = `${root}/src/template.html`
  const dest = `${root}/docs/index.html`

  const template = fs.readFileSync(src, 'utf8')
  const str = articles.join('\n')
  fs.writeFileSync(dest, template.replace('<posts/>', str))
}

main()
