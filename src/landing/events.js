const handlers = { accept: new Set(), reject: new Set() };

export function emit(name) {
  handlers[name]?.forEach((fn) => fn());
}

export function on(name, fn) {
  handlers[name].add(fn);
  return () => handlers[name].delete(fn);
}
