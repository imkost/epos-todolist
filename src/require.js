window.require = require

let count = 0

function require (cssPath, importMeta) {
  if (cssPath.startsWith('./')) {
    const folderPath = importMeta.url.split('/').slice(0, -1).join('/')
    cssPath = folderPath + cssPath.replace('.', '')
  }

  document.body.style.display = 'none'
  count += 1

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = cssPath
  link.onload = onLoad
  document.head.appendChild(link)
}

function onLoad () {
  count -= 1
  if (count === 0) {
    document.body.style.display = ''
    if (document.body.getAttribute('style') === '') {
      document.body.removeAttribute('style')
    }
  }
}
