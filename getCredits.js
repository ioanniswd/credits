// Expected input: group_id, username (Required)
// Returns the credits of user.

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context, callback) {

  var params;

  // just checking
  if(!event.group_id) {
    callback("No group id given");
  }
  if(!event.username) {
    callback("No username given");
  }

  params = {
    ExpressionAttributeValues: {
      ":given_group_id": {
        "N": event.group_id.toString()
      },
      ":given_username": {
        "S": event.username.toString()
      }
    },
    ExpressionAttributeNames: {
      "#gid": "group_id",
      "#u": "username"
    },
    KeyConditionExpression: "#gid = :given_group_id AND #u = :given_username",
    IndexName: "username-index",
    TableName: "customers",
    ProjectionExpression: "credits"
  };

  dynamodb.query(params, function(err,data) {
    if(err) {
      callback(err);
    } else {
        if(data.Items.length === 0) {
            callback("Username does not exist");
        } else {
            callback(null, data.Items[0].credits.N);
        }
    }
  });

};
