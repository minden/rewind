Votes = new Mongo.Collection('votes');

Meteor.methods({

  /** Insert a new vote into the votes collection */
  voteInsert: function(voteAttributes){

    check(this.userId, String);
    check(voteAttributes, {
      questionId: String, 
    });

    var vote = _.extend(voteAttributes, {
      author: Meteor.userId()
    });

    var voteExists = Votes.findOne({author: vote.author, questionId: vote.questionId});
    if(voteExists){
      return;
    };

    Votes.insert(vote); 
  },

  /** Delete an existing vote from the votes collection */
  voteDelete: function(questionId){
    check(questionId, String);

    Votes.remove({author: Meteor.userId(), questionId: questionId});
  }
  

});