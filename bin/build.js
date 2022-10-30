const marked = require('marked')
const fs = require('fs')
const path = require('path')
const txl = require('txl')
const hl = require('highlight.js')

marked.setOptions({
  highlight: code => {
    return hl.highlightAuto(code).value
  }
})

const root = path.join(__dirname, '..')
const src = path.join(root, 'src')
const dest = path.join(root, 'docs')

const read = p => fs.readFileSync(`${src}${p}`, 'utf8')
const name = (s, c) => s.replace(/\s+/g, c).toLowerCase().slice(0, -3)

const templateIndex = txl(read(`/templates/index.html`))
const templatePost = txl(read(`/templates/post.html`))

function main () {
  const dirs = fs.readdirSync(`${src}/articles`)
  let index = ''
  let posts = ''

  dirs.forEach(dir => {
    const files = fs.readdirSync(`${src}/articles/${dir}`)
      .filter(f => path.extname(f) === '.md')

    const links = files.map((file, index) => {
      return `
        <a class="link" href="#post-${name(file, '-')}">
          ${name(file, ' ')}
        </a>
        <br>
      `
    })

    index += [
      `<h3>${dir}</h3>`,
      links.join('\n\n')
    ].join('\n')

    posts += files.map((file, index) => {
      const content = marked(read(`/articles/${dir}/${file}`))
      return templatePost({ content, id: `post-${name(file, '-')}` })
    }).join('\n')
  })

  const content = templateIndex({ posts, index })
  fs.writeFileSync(`${dest}/index.html`, content)
}

main()
