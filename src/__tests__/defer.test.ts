import jpex from 'jpex';
import { provide, defer } from '..';

jpex.factory(
  'REVERSE',
  [],
  () => (str: string) => str.split('').reverse().join(''),
);

const reverse: any = defer('REVERSE');

it('resolves root dependencies when the function is called', () => {
  const result = reverse('hello');

  expect(result).toBe('olleh');
});

describe('when called inside a default provider', () => {
  it('resolves dependencies with the child instance', async () => {
    const result = await provide((jpex) => {
      jpex.factory('REVERSE', [], () => () => 'bar');

      return new Promise((res) => {
        res(reverse());
      });
    });

    expect(result).toBe('bar');
  });
});

describe('when called inside a specific provider', () => {
  it('resolves dependencies with the given instance', async () => {
    const j = jpex.extend();
    j.factory('REVERSE', [], () => () => 'bar');

    const result = await provide(j, () => {
      return new Promise((res) => {
        res(reverse());
      });
    });

    expect(result).toBe('bar');
  });
});
