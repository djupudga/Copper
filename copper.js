(function(context, undefined) {
    // A registry that contains all compositions
    // registered by name.
    var assemblies = {}

    var isArray = Array.isArray || function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]'
    }

    function toArray(obj) {
        return Array.prototype.slice.call(obj)
    }

    // Creates a before advice that will execute before the given function
    // is executed.
    // Parameters:
    //
    // *    advice
    //      > The advice function
    //
    // *    object
    //      > Object or module containing function to execute by the advice.
    //
    // *    functionName
    //      > Name of function to be executed by the advice
    //
    // *    executionContext
    //      > The execution context of the advice if other than object.
    //
    //
    // ###Example
    //
    //      // Calling Model.save() will execute the before advice first
    //      copper.addBefore(SomeModel, 'save', function(val) {
    //          if (val == undefined)
    //              throw new Error('Value can\'t be undefined');
    //      });
    function before(advice, object, functionName, executionContext) {
        if (!object) throw new Error('#addBefore: object can\'t be undefined');
        var callback = object[functionName];
        var target = object;
        if (!callback) {
            callback = object.prototype[functionName];
            target = object.prototype;
        }
        target[functionName] = function() {
            var _context = executionContext || this;
            advice.apply(_context, arguments);
            return callback.apply(_context, arguments);
        }
    }
    // Creates an after advice on a function that executes after the function
    // has executed.
    function after(advice, object, functionName, executionContext) {
        if (!object) throw new Error('#addAfter: object can\'t be undefined');
        var callback = object[functionName];
        var target = object;
        if (!callback) {
            callback = object.prototype[functionName];
            target = object.prototype;
        }
        target[functionName] = function() {
            var _context = executionContext || this;
            var retVal = callback.apply(_context, arguments);
            if (!isArray(retVal)) {
                retVal = Array(retVal);
            }
            return advice.apply(_context, retVal);
        }
    }
    // Creates an around advice. The last parameter to the around advice is the
    // function to embed.
    //      function transactional(dataToSaveIntoDatabase, yield) {
    //          try {
    //              TransactionManager.begin();
    //              yield(dataToSaveIntoDatabase);
    //              TransactionManager.commit();
    //          } catch (e) {
    //              TransactionManager.rollback();
    //              throw new TransactionError(
    //                  "Transaction failed with error: " + e.message
    //              );
    //          }
    //      }
    function around(advice, object, functionName, executionContext) {
        var fn
          , target

        if (!object) throw new Error('#addAround: object can\'t be undefined');
        fn = object[functionName];
        target = object;
        if (!fn) {
            fn = object.prototype[functionName];
            target = object.prototype;
        }
        target[functionName] = function() {
            var _context = executionContext || this;
            var callback = function() {
                return fn.apply(_context, arguments);
            };
            var params = toArray(arguments);
            params.push(callback);
            return advice.apply(_context, params);
        }
    }

    // Mixin arguments to target.
    function mixin(target) {
        var mixins
        if (isArray(arguments[1])) mixins = arguments[1]
        else {
            mixins = toArray(arguments)
            mixins.shift()
        }
        for (var i = 0, len = mixins.length, mix; i < len; i++) {
            mix = mixins[i]
            for (var j in mix) {
                target[j] = mix[j]
            }
        }
        return target
    }

    // Composes an object based on the provided composition
    // and returns an instance of the composed object. If name
    // is provided, the composed object is registered and available
    // via copper.create(namespace)
    function compose(composition) {
        var obj = {}
          , args

        if (composition.mixins !== undefined) {
            mixin(obj, composition.mixins)
        }
        var aspects = {
              before: before
            , after: after
            , around: around
        }
        function processAspects(name) {
            if (composition[name]) {
                for (i in composition[name]) {
                    if (obj[i] === undefined) {
                        throw new Error(
                            '#' + name + ' - Unknown method:' + i
                        )
                    }
                    aspects[name](
                          composition[name][i]
                        , obj
                        , i
                    )
                }
            }
        }
        processAspects('before')
        processAspects('after')
        processAspects('around')

        function _create(args) {
            var f
            if (composition.singleton) {
                return obj
            } else {
                f = function() {
                    if (composition.create) {
                        composition.create.apply(this, args)
                    }
                }
                f.prototype = obj
                return new f
            }
        }
        if (composition.name) {
            assemblies[composition.name] = _create
        }
        // TODO: forward extra args to _create
        if (arguments.length > 1) {
            args = toArray(arguments)
            args.shift()
        }
        return _create.call(this, args)
    }

    function create(name) {
        if (typeof name === 'object') return compose.apply(this, arguments)
        if (assemblies.hasOwnProperty(name)) {
            var args = toArray(arguments)
            if (args.length > 1) args.shift()
            return assemblies[name](args)
        }
        throw new Error('No assembly registered for name: ' + name)
    }

    // Export API
    context.copper = {
          compose: compose
        , create: create
        , before: before
        , after: after
        , around: around
        , mixin: mixin
    }
})(this)