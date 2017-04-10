// Expected input: group_id, username (Required)
// Checks if there is a user with the given username in the same
// group(group_id).


var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context, callback) {

  var params;

  // just checking
  if(!event.username) {
    callback("No username given");
  }

  params = {
    ExpressionAttributeValues: {
      ":given_group_id": {
        "N": event.group_id.toString()
      },
      ":given_username": {
        "S": event.username
      }
    },
    ExpressionAttributeNames: {
      "#gid": "group_id",
      "#u": "username"
    },
    KeyConditionExpression: "#gid = :given_group_id AND #u = :given_username",
    ProjectionExpression: "username",
    IndexName: "username-index",
    TableName: "customers"
  };

  dynamodb.query(params, function(err, data) {
    if(err) {
      callback(err);
    } else {
      if(data.Items.length > 0) {
        callback(null, {
          "exists": true,
          "comments": "User already exists"
        });
      } else {
        callback(null, {
          "exists": false,
          "comments": "User does not exist"
        });
      }
    }
  });
};
