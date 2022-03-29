import { parseVariadicArguments, resolveArgsAsync } from '../resolveOptions';

describe(parseVariadicArguments, () => {
  it(`parses complex`, () => {
    expect(
      parseVariadicArguments([
        'bacon',
        '@evan/bacon',
        '--yarn',
        '-g',
        '@evan/bacon/foobar.js',
        './avocado.js',
        '--',
        '--npm',
      ])
    ).toEqual({
      variadic: ['bacon', '@evan/bacon', '@evan/bacon/foobar.js', './avocado.js'],
      extras: ['--npm'],
      flags: { '--yarn': true, '-g': true },
    });
  });
  it(`parses too many extras`, () => {
    expect(() => parseVariadicArguments(['avo', '--', '--npm', '--'])).toThrow(
      /Unexpected multiple --/
    );
  });
});

describe(resolveArgsAsync, () => {
  it(`asserts invalid flags`, async () => {
    await expect(resolveArgsAsync(['-g', '--bacon'])).rejects.toThrow(/Unexpected: -g, --bacon/);
  });
  it(`prevents bad combos`, async () => {
    await expect(resolveArgsAsync(['--npm', '--yarn'])).rejects.toThrow(
      /Specify at most one of: --npm, --yarn/
    );
  });
  it(`allows known values`, async () => {
    const result = await resolveArgsAsync([
      'bacon',
      '@evan/bacon',
      '--yarn',
      'another@foobar',
      'file:../thing',
      '--',
      '--npm',
      '-g',
      'not-a-plugin',
    ]);
    expect(result).toEqual({
      variadic: ['bacon', '@evan/bacon', 'another@foobar', 'file:../thing'],
      options: {
        npm: false,
        yarn: true,
      },
      extras: ['--npm', '-g', 'not-a-plugin'],
    });
  });
  it(`allows known values without correct chaining`, async () => {
    const result = await resolveArgsAsync(['expo', '--npm', '--']);
    expect(result).toEqual({
      variadic: ['expo'],
      options: {
        npm: true,
        yarn: false,
      },
      extras: [],
    });
  });
});
