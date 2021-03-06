var FunctionBind = require('function-bind')
var defaultConsole = require('console') // So browserify uses the polyfill

module.exports = Test

function Test (name, opts, fn) {
  if (!(this instanceof Test)) return new Test(name, opts, fn)
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  if (typeof name === 'function') {
    fn = name
    name = undefined
  }

  this._events = {}

  this._name = name
  this._opts = opts
  this._fn = fn
  this._tests = []
  this._plan = 0
  this._count = 0
  this._passed = 0
  this._failed = 0
  this._offset = 0

  this.end = FunctionBind.call(this.end, this)
  this.pass = FunctionBind.call(this.pass, this)
  this.fail = FunctionBind.call(this.fail, this)
  this.onFinish = FunctionBind.call(this.onFinish, this)
}

Test.prototype._log = function (msg) {
  var console = this._opts.console || defaultConsole
  if (console) console.log(msg)
}

Test.prototype.test = function (name, opts, fn) {
  var t = new Test(name, opts, fn)
  var self = this
  t.on('prerun', function () {
    t._offset = self._count
  })
  t.on('end', function () {
    self._count += t._count
    self._passed += t._passed
    self._failed += t._failed
  })
  this._tests.push(t)
}

Test.prototype.on = function (name, fn) {
  if (!this._events[name]) this._events[name] = []
  this._events[name].push(fn)
  return this
}

Test.prototype.emit = function (name) {
  var handlers = this._events[name]
  if (!handlers) return
  var args = []
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i])

  for (i = 0; i < handlers.length; i++) {
    handlers[i].apply(this, args)
  }
}

Test.prototype.run = function () {
  if (this._opts.skip) {
    this.comment('SKIP ' + this._name)
    return this._end()
  }

  var self = this
  this.emit('prerun')

  if (!this._opts.root) this.comment(this._name)
  next()

  function next () {
    if (self._tests.length === 0) return done()
    var test = self._tests.shift()
    test.on('end', function () { process.nextTick(next) })
    test.run()
  }
  function done () {
    self._fn(self)
    self.emit('run')
  }
}

Test.prototype._pass = function (n, message) {
  this._passed++
  this._log('ok ' + (this._offset + n) + ' ' + message)
}

Test.prototype._fail = function (n, message) {
  this._failed++
  this._log('not ok ' + (this._offset + n) + ' ' + message)
}

Test.prototype._end = function () {
  this.emit('end')
  if (this._opts.root) {
    this._log('1..' + this._passed)
  }
}

Test.prototype.plan = function (n) {
  this._plan = n
}

Test.prototype.end = function () {
  this._end()
}

Test.prototype.ok = function (val, message) {
  if (!message) message = 'should be truthy'
  this._count++
  if (val) this._pass(this._count, message)
  else this._fail(this._count, message)
  if (this._count === this._plan) this._end()
}

Test.prototype.pass = function (message) {
  this.ok(true, message || '(unnamed assert)')
}

Test.prototype.fail = function (message) {
  this.ok(false, message)
}

Test.prototype.error = function (message) {
  this.ok(false, message)
}

Test.prototype.equal = function (a, b, message) {
  this.ok(a == b, message || 'should be equal') // eslint-disable-line eqeqeq
}

Test.prototype.notEqual = function (a, b, message) {
  this.ok(a != b, message || 'should not be equal') // eslint-disable-line eqeqeq
}

Test.prototype.strictEqual = function (a, b, message) {
  this.ok(a === b, message || 'should be equal')
}

Test.prototype.notStrictEqual = function (a, b, message) {
  this.ok(a !== b, message || 'should not be equal')
}

Test.prototype.throws = function (fn, filter, message) {
  if (typeof filter === 'string') {
    message = filter
    filter = null
  }

  try {
    fn()
    this.ok(false, 'should have thrown')
  } catch (err) {
    if (filter instanceof RegExp) this.ok(err && filter.test(err.message), 'should have thrown')
    else if (typeof filter === 'function') this.ok(err && err instanceof filter, 'should have thrown')
    else this.ok(true, 'should have thrown')
  }
}

Test.prototype.comment = function (message) {
  this._log('# ' + message)
}

Test.prototype.onFinish = function (fn) {
  this.on('end', fn)
}
