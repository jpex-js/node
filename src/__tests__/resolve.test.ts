import jpex from 'jpex';
import { provide, resolve } from '..';

jpex.factory('FOO', [], () => 'foo');

it('resolves a dependency using the root jpex instance', () => {
  const foo = resolve('FOO');
  expect(foo).toBe('foo');
});

describe('when called inside a provider', () => {
  it('resolves a dependency using the provided jpex instance', async () => {
    const foo = await provide((jpex) => {
      jpex.factory('FOO', [], () => 'bar');

      return new Promise((res) => {
        setTimeout(() => {
          const foo = resolve('FOO');
          res(foo);
        }, 250);
      });
    });

    expect(foo).toBe('bar');
  });
});
