window.require = require

let count = 0

function require (cssPath) {
  if (cssPath.startsWith('./')) {
    cssPath = cssPath.replace('./', '/ui/')
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
