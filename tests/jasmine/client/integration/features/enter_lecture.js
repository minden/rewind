describe("Enter lecture", function() {
  var lectureCode;
  beforeAll(function(done) {
    Fixtures.clearDB(function(error, result) {
      done()
    });
  });

  beforeAll(function(done) {
    Fixtures.createLecture({lectureCode: '00007'}, function(error, result) {
      lectureCode = result;
      done()
    });
  });

  beforeAll(function(done) {
    Router.go('landingPage');
    Tracker.afterFlush(done);
  });

  beforeAll(waitForRouter);

  beforeAll(function(done) {
    $('#lecture-code-input').val(lectureCode);
    $('#btn-enter-class').trigger("click");
    waitForElement('#question-text', function() {
      done();
    });
  });

  it("routes to a lecture page", function(){
    expect(Router._currentRoute.getName()).toEqual('lecturePage');
  });

});

