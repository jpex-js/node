import { AsyncLocalStorage } from 'async_hooks';
import base, { Jpex, ResolveOpts } from 'jpex';

const storage: AsyncLocalStorage<Jpex> = new AsyncLocalStorage();

function getJpex() {
  return storage.getStore() ?? base;
}

function provide<T>(jpex: Jpex, callback: (jpex: Jpex) => T): T;
function provide<T>(callback: (jpex: Jpex) => T): T;
function provide(...args: any[]) {
  const callback = args.pop();
  const jpex = args.pop() ?? getJpex().extend();

  return storage.run(jpex, () => callback(jpex));
}

function resolve<T>(): T;
function resolve<T>(opts: ResolveOpts): T;
function resolve<T>(name: string): T;
function resolve<T>(name: string, opts: ResolveOpts): T;
function resolve(name?: any, opts?: any) {
  const jpex = getJpex();
  return jpex.resolve(name, opts);
}

type Encase = typeof base.encase;

const encase = ((dependencies: string[], fn: (...args: any[]) => any) => {
  const encased = (...args: any[]) => {
    const jpex = getJpex();
    const deps = dependencies.map((name) => jpex.resolve(name));
    const resultFn = fn.apply(jpex, deps);
    return resultFn(...args);
  };
  encased.encased = fn;
  return encased;
}) as Encase;

export { getJpex, provide, resolve, encase };
