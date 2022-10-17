import Cookie from 'js-cookie';

export interface WithLengthObject extends Object {
  length?: number;
}

class Preferences {
  get<D extends object>(key: string, defaultValue: D): D {
    if (key) {
      const data = Cookie.get(key);
      if (data) {
        return JSON.parse(data) as D;
      }
    }
    return defaultValue;
  }

  set(key: string, value: WithLengthObject) {
    if (key) {
      Cookie.set(key, JSON.stringify(value), {
        sameSite: 'none',
        secure: true,
      });
    }
  }
}

export default new Preferences();
