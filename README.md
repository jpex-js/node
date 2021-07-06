# @jpex-js/node

This is a very small wrapper around the `jpex` library that allows you to enapsulate and sandbox your dependency injection lifecycles.

Effectively this allows you to provide a new jpex container that your application will use to resolve its dependencies.

## Example

Let's learn through a basic example. Suppose we have a dependency, Foo:

```ts
import jpex from 'jpex';

jpex.constant<Foo>('foo');
```

```ts
import { encase, resolve } from '@jpex-js/node';

const fn1 = encase((foo: Foo) => () => {
  return foo;
});

const fn2 = () => {
  const foo = resolve<Foo>();
  return foo;
};
```

In _normal_ circumstances you would expect to get the following output:

```ts
fn1(); // 'foo'
fn2(); // 'foo'
```

Both functions use the global jpex instance to resolve their dependencies. This is good and is how jpex works. However, sometimes, such as when writing tests, you want to mock certain dependencies. You don't want to register mocks on the global jpex container as this may bleed into other tests, but you can't exactly tell these functions to use another container, can you?

Yes you can!

```ts
import { provide } from '@jpex-js/node';

// this creates a sort of "sandbox" and everything inside it will be
// given this shiny new instance
provide((jpex) => {
  jpex.constant<Foo>('fake foo');

  fn1(); // 'fake foo'
  fn2(); // 'fake foo'
});
```

Notably, you can pass in a pre-configured jpex instance of your own if you prefer:

```ts
import { provider } from '@jpex-js/node';

provide(myPreStubbedJpex, () => {
  fn1(); // 'fake foo'
  fn2(); // 'fake foo'
});
```

But the coolest part is that the provider can handle asynchronous tasks too. Under the hood we're using `AsyncLocalStorage` which is able to track the context through multiple promises as callbacks!

```ts
import { provider } from '@jpex-js/node';

const doStuff = () =>
  new Promise((res) => {
    setTimeout(() => {
      res(fn1() + fn2());
    }, 3000);
  });

const result = await provider(async () => {
  await someAsyncFn();

  const result = await doStuff();

  // oh yeah you can also return data out of the provider!
  return result;
});

result; // 'fake foofake foo';
```

## Api

### provide

```ts
<T>(instance?: Jpex, callback: (jpex: Jpex) => T): T
```

Creates a new context where in all calls to `resolve` `encase` and `getJpex` are bound to `instance`. If no instance is provided, it will create a new one.

### getJpex

```ts
(): Jpex
```

Returns the current jpex instance. If called outside of any `provide` context, it will return the global instance.

### resolve

```ts
<T>(opts?: object): T
```

Resolve a dependency. Essentially the same as `jpex.resolve` except it uses the provided context.

### encase

```ts
(...deps: any[]) =>
  (...args: any[]) =>
    any;
```

Essentially the same as `jpex.encase`. When the resulting function is called, it will use the provided context to resolve the dependencies.
