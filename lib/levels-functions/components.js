export const enable = (component) => {
  const c = this.get_target(component);
  if (c.state !== 'active') {
    c.state = 'active';
    this.mark_dirty(c);
    this.exec(c, 'enable');
  }
};

export const disable = (component) => {
  const c = this.get_target(component);
  if (c.state !== 'inactive') {
    c.state = 'inactive';
    this.mark_dirty(c);
    this.exec(c, 'disable');
  }
};

export const duplicate = (component, duplicate_id) => {
  const c = JSON.parse(JSON.stringify(this.get_target(component)));
  c.id = duplicate_id;
  this.mark_dirty(c);
  this.components.push(c);
  return c;
};

export const change = (target, path, value) => {
  const subpaths = path.split('.');

  if (subpaths[0] == 'state') {
    throw new Error("Don't change state with change(), use enable() or disable()");
  }
  const c = this.get_target(target);
  this.mark_dirty(c);
  let t = c;

  const lastItem = subpaths.pop();
  for (let subpath of subpaths) {
    t = t[subpath];
  }
  t[lastItem] = value;

  if (subpaths[0] == 'visibility') {
    this.mark_dirty(c); // needs to be marked dirty again, in case we changed visibility for some players
  }
};
