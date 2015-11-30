"use strict";

if (Meteor.isClient) {
  var Factory, FactoryClosure;

  FactoryWoman = {
    _factories: {},
    begin: function(func, callback, func_count) {
      console.log('Beginning with new closure '); 
      new FactoryClosure(func, callback, func_count);
    },
    create: function(name, changes, traits) {
      // this refering to a FactoryClosure object
      var self = this;
      var result, factory;

      console.log('Calling factory ' + name);
      factory = FactoryWoman._factories[name];
      if (factory === undefined) {
        console.error('Factory ' + name + ' is not defined.');
        return;
      }

      result = _.clone(factory._attr);
      _.extend(result, changes);

      console.log('Inserting factory ' + name);
      console.log('Collection: ' + factory._collection);
      console.log('Attr: ' + factory._attr);
      Meteor.call('factoryWomanInsert', factory._collection, result, function(error, insertResult) {
        if (error) {
          console.error('Error creating factory ' + name + '.');
          console.error(error);
          self._counter++;
          return;
        }

        result._id = insertResult;

        console.log('Done inserting factory ' + name);
        if (traits === undefined)
          traits = [];
        else if (typeof traits === 'string')
          traits = [traits];

        _.each(traits, function(trait) {
          var traitReturn;

          console.log('Calling trait ' + trait);
          traitReturn = factory._traits[trait].call(self, result);
          _.extend(result, traitReturn);
          self._stack.push({
            collection: factory._collection,
            attr: traitReturn,
            result: result
          });
        });

        self._counter++;
        console.log('===== INCREASED FUNCTION COUNTER TO ' + self._counter + ' =====');
      });

      return result;
    },
    define: function(name, collection, attr) {
      var factory;

      if (this._factories[name] === undefined) {
        factory = new Factory(collection, attr);
        this._factories[name] = factory;
      } else {
        factory = new Factory('', {});
        console.error('Factory ' + name + ' already defined.');
      }

      return factory;
    }
  };

  FactoryClosure = function(func, callback, func_count) {
    var self = this;

    this._callback = callback;
    this._func_count = func_count;
    this._counter = 0;
    this._trait_counter = 0;
    this._stack = [];
    console.log('Starting closure worker');
    this._interval = setInterval(function() {
      self.closureWorker();
    }, 50);

    func.call(this);
  };

  FactoryClosure.prototype.create = function(name, changes, traits) {
    return FactoryWoman.create.call(this, name, changes, traits);
  };

  FactoryClosure.prototype.closureWorker = function() {
    var self = this;
    console.log(this._counter);
    console.log(this._func_count);
    console.log(this._trait_counter);
    console.log(this._stack);
    if (this._counter >= this._func_count) {
      console.log('WOOOT');
      // we got all functions running, time to check the stack
      if (this._stack.length > 0) {
        console.log('Found object on stack');
        var obj = this._stack.pop();

        if (obj.result._id === undefined) {
          console.log('_id still undefined, aborting');
          this._stack.push(obj);
          return;
        }

        console.log('_id defined, updating');
        this._trait_counter++;
        Meteor.call('factoryWomanUpdate', obj.result._id, obj.collection, obj.attr, function(error) {
          if (error)
            console.error('Error updating trait');

          console.log('Updating with: ********* ');
          console.log(obj.result._id);
          console.log(obj.attr);
          _.extend(obj.result, obj.attr);
          console.log('Done updating trait');
          self._trait_counter--;
        });
      }
    }

    if ((this._counter >= this._func_count)
        && (this._trait_counter === 0)
        && (this._stack.length === 0)) {
      console.log('Closure finished');
      clearInterval(this._interval);
      this._callback();
    };
  };

  Factory = function(collection, attr) {
    this._collection = collection;
    this._attr = attr;
    this._traits = {};
  };

  Factory.prototype.trait = function(name, func) {
    if (this._traits[name] === undefined)
      this._traits[name] = func;
    else
      console.error('Trait ' + name + ' already defined.');

    return this;
  };
};

if (Meteor.isServer) {
  FactoryWoman = {
    _collections: {}
  };

  Meteor.addCollectionExtension(function(collection) {
    FactoryWoman._collections[collection._name] = collection;
  });

  Meteor.methods({
    factoryWomanInsert: function(collection_name, attr) {
      return FactoryWoman._collections[collection_name].insert(attr);
    },
    factoryWomanUpdate: function(id, collection_name, attr) {
      return FactoryWoman._collections[collection_name].update({_id: id}, {$set: attr});
    }
  });
}