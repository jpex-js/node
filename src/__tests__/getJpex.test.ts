import jpex from 'jpex';
import { provide, getJpex } from '..';

it('returns the base jpex instance', () => {
  const x = getJpex();
  expect(x).toBe(jpex);
});

describe('when inside a default provider', () => {
  it('returns a new jpex instance', () => {
    const x = provide(() => {
      return getJpex();
    });

    expect(x.factory).toBeInstanceOf(Function);
    expect(x).not.toBe(jpex);
  });
});

describe('when inside a specific provider', () => {
  it('returns the provided jpex instance', () => {
    const j = jpex.extend();

    const x = provide(j, () => {
      return getJpex();
    });

    expect(x).not.toBe(jpex);
    expect(x).toBe(j);
  });
});
