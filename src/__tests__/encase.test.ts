import jpex from 'jpex';
import { provide, encase } from '..';

jpex.factory('FOO', [], () => 'foo');

const fn = encase(['FOO'], (foo: string) => () => foo);

it('resolves root dependencies when the function is called', () => {
  const result = fn();

  expect(result).toBe('foo');
});

describe('when called inside a default provider', () => {
  it('resolves dependencies with the child instance', async () => {
    const result = await provide((jpex) => {
      jpex.factory('FOO', [], () => 'bar');

      return new Promise((res) => {
        res(fn());
      });
    });

    expect(result).toBe('bar');
  });
});

describe('when called inside a specific provider', () => {
  it('resolves dependencies with the given instance', async () => {
    const j = jpex.extend();
    j.factory('FOO', [], () => 'bar');

    const result = await provide(j, () => {
      return new Promise((res) => {
        res(fn());
      });
    });

    expect(result).toBe('bar');
  });
});
