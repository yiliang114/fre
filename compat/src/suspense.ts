import {
  jsx,
  useState,
  useEffect,
  EffectCallback,
  options
} from '../../src'

let oldCatchError = options.catchError
options.catchError = (fiber, error) => {
  if (!!error && typeof error.then === 'function') {
    fiber.promises = fiber.promises || []
    fiber.promises.push(error as any)
    oldCatchError()
  }
}

export function lazy(loader) {
  let p
  let comp
  let err
  return function Lazy(props) {
    if (!p) {
      p = loader()
      p.then(
        exports => (comp = exports.default || exports),
        e => (err = e)
      )
    }
    if (err) throw err
    if (!comp) throw p
    return jsx(comp, props)
  }
}

export function Suspense(props) {
  const [suspend, setSuspend] = useState(false)
  const cb = current => {
    Promise.all(current.promises).then(() => setSuspend(true))
  }
  useEffect(cb as EffectCallback, [])
  return [props.children, !suspend && props.fallback]
}
