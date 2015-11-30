describe('FactoryWoman', function() {
  FactoryWoman.define('user1', 'users', {
    name: 'Chuck',
    lastName: 'Testa',
    city: 'Ojai Valley'
  }).trait('with animals', function(user) {
    return {
      animals: [
        this.create('animal1', {owner: user._id}, 'special lion'),
        this.create('animal2', {owner: user._id})
      ]
    };
  });

  FactoryWoman.define('animal1', 'animals', {
    type: 'Lion',
    weight: 267
  }).trait('special lion', function(lion) {
    return {
      weight: lion.weight + 50
    }
  });

  FactoryWoman.define('animal2', 'animals', {
    type: 'Turkey',
    weight: 4
  });

  beforeEach(function(done) {
    Meteor.call('resetDatabase', function() {
      done();
    });
  });

  describe('basic functionality', function() {
    beforeEach(function(done) {
      FactoryWoman.begin(function() {
        this.create('user1');
      }, done, 1);
    });

    it('inserts data in the database', function() {
      var user = User.findOne({name: 'Chuck'});

      expect(user).toBeDefined();
      expect(user.name).toEqual('Chuck');
      expect(user.lastName).toEqual('Testa');
      expect(user.city).toEqual('Ojai Valley');
    });

    it('includes the returned id of the set of data', function() {
      var user = User.findOne({name: 'Chuck'});

      expect(user._id).toBeDefined();
    });
  });

  describe('changing default values', function() {
    beforeEach(function(done) {
      FactoryWoman.begin(function() {
        this.create('user1', {
          city: 'Nopetown',
          zip: '48149',
          age: 55
        });
      }, done, 1);
    });

    it('overwrites existing values', function() {
      var user = User.findOne({name: 'Chuck'});

      expect(user.name).toEqual('Chuck');
      expect(user.lastName).toEqual('Testa');
      expect(user.city).toEqual('Nopetown');
    });

    it('adds new values', function() {
      var user = User.findOne({name: 'Chuck'});

      expect(user.zip).toEqual('48149');
      expect(user.age).toEqual(55);
    });
  });

  describe('traits', function() {
    var userObject;

    beforeEach(function(done) {
      FactoryWoman.begin(function() {
        userObject = this.create('user1', {}, 'with animals');
      }, done, 1);
    });

    it('handles the trait', function() {
      var user = User.findOne({name: 'Chuck'});
      var animal1 = Animal.findOne({type: 'Lion'});
      var animal2 = Animal.findOne({type: 'Turkey'});

      expect(user).toBeDefined();
      expect(animal1).toBeDefined();
      expect(animal2).toBeDefined();
    });

    it('properly handles sub traits', function() {
      var user = User.findOne({name: 'Chuck'});
      var animal1 = Animal.findOne({type: 'Lion'});
      var animal2 = Animal.findOne({type: 'Turkey'});

      expect(user.animals).toBeDefined();
      expect(user.animals.length).toEqual(2);
      expect(user.animals[0].type).toEqual('Lion');
      expect(user.animals[1].type).toEqual('Turkey');
      expect(user.animals[0]._id).toEqual(animal1._id);
      expect(user.animals[1]._id).toEqual(animal2._id);
      expect(user.animals[0].weight).toEqual(317);
    });

    it('returns the correct object directly', function() {
      var user = User.findOne({name: 'Chuck'});
      var animal1 = Animal.findOne({type: 'Lion'});
      var animal2 = Animal.findOne({type: 'Turkey'});

      expect(userObject).toEqual({
        _id: user._id,
        name: 'Chuck',
        lastName: 'Testa',
        city: 'Ojai Valley',
        animals:
        [
          {
            _id: animal1._id,
            type: 'Lion',
            weight: 317,
            owner: user._id
          },
          {
            _id: animal2._id,
            type: 'Turkey',
            weight: 4,
            owner: user._id
          }
        ]
      });
    });
  });
});