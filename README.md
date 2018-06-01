# old-tape

a [tape][]-like test harness for really really old browsers (i.e. IE8)

old-tape uses `console.log` instead of output streams. this is not configurable.
It approximates the [tape][] API in most situations but the point is to make tests in IE8 _work_, not to make them work _well_. :)

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/old-tape.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/old-tape
[travis-image]: https://img.shields.io/travis/goto-bus-stop/old-tape.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/old-tape
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install old-tape
```

## Usage

You can switch between using [`tape`][tape] in modern browsers and Node, and `old-tape` in old browsers.
A good feature to check for is `defineProperty`-ing a getter, this is required for [tape][] to work but pre ES5 browsers and IE8 can't do it.

```js
var isModern = (function () {
  try { return Object.defineProperty({}, 'a', { get: function () { return 'xyz' } }).a === 'xyz' }
  catch (err) { return false }
}())
var test = isModern ? require('tape') : require('old-tape')

test('my thing', function (t) {
  t.equal(1, 2, 'haha')
  t.end()
})
```

If you have many test files this might be cumbersome, instead you can use a proxy module:

```js
// tape-or-old-tape.js
var isModern = (function () {
  try { return Object.defineProperty({}, 'a', { get: function () { return 'xyz' } }).a === 'xyz' }
  catch (err) { return false }
}())
module.exports = isModern ? require('tape') : require('old-tape')
```

Then when building tests for the browser do:

```bash
browserify tests/index.js -r ./tape-or-old-tape:tape
```

## License

[Apache-2.0](LICENSE.md)

[tape]: https://github.com/substack/node-tape
