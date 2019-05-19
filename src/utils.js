export function series (funcs) {
  return (...args) => funcs.forEach(f => f(...args))
}

export function splitCamelCase (string) {
  return string.split(/(?=[A-Z])/g)
}

export function safeAppend (target, value) {
  if (Array.isArray(target)) return target.concat([value])
  else return [target, value]
}

export function mergeWith (resolver, objA, objB) {
  let result = Object.assign({}, objA)
  Object.entries(objB)
    .forEach(([key, value]) => {
      if (key in result) {
        result[key] = safeAppend(result[key], value)
      } else {
        result[key] = [value]
      }
    })

  Object.entries(result)
    .forEach(([key, values]) => {
      if (values.length === 1) result[key] = values[0]
      else result[key] = resolver(values, key)
    })
  return result
}

// export function filterObj (obj, pred) {
//   let result = {}
//   Object.entries(obj)
//     .forEach(([key, val]) => pred(key, val) ? result[key] = val : undefined)
//   return result
// }

export function mapObj (obj, mapper) {
  let result = {}
  Object.entries(obj)
    .forEach(([key, val]) => result[key] = mapper(key, val))
  return result
}

export function setPath (obj, path, value) {
  const pathParts = path.slice()
  const propToSet = pathParts.pop()
  let current = obj
  pathParts.forEach(p => {
    if (typeof current[p] !== 'object') current[p] = {}
    current = current[p]
  })
  current[propToSet] = value
}
