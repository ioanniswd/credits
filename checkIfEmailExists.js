// Expected input: email, group_id
// Checks if there is a user with the given email in the same group(group_id).

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context, callback) {
  var params;

  if(!event.email) {
    callback("No e-mail given");
  }

  params = {
    ExpressionAttributeValues: {
      ":given_email": {
        "S": event.email
      },
      ":given_group_id": {
        "N": event.group_id.toString()
      }
    },
    ExpressionAttributeNames: {
      "#gid": "group_id",
      "#e": "email"
    },
    KeyConditionExpression: "#e = :given_email AND #gid = :given_group_id",
    ProjectionExpression: "email",
    IndexName: "email-index",
    TableName: "customers"
  };

  dynamodb.query(params, function(err, data) {
    if(err) {
      callback(err);
    } else {
      if(data.Items.length > 0) {
        callback(null, {"exists": true, "comments": "User already exists"});
      } else {
        callback(null, {
          "exists": false,
          "comments": "User does not exist"
        });
      }
    }
  });
};
