export default function bemClassProcessor (props = {}) {
  if (typeof props === 'string') {
    return props
  }

  const className = props.name
  const mods = {...props}
  delete mods.name

  if (!mods) {
    return className
  }

  if (typeof mods === 'string') {
    return `${className} ${className}_${mods}`
  }

  const classes = [className]
  Object.keys(mods).forEach(k => {
    const v = mods[k]
    if (v === true) {
      classes.push(`${className}_${k}`)
    } else if (typeof v === 'number' || (typeof v === 'string' && v)) {
      classes.push(`${className}_${k}_${v}`)
    }
  })

  return classes.join(' ')
}
