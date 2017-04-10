// Expected input:
// group_id, customer_email OR customer_username
// Deletes user's online account(removes attributes email, username and
// password)

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context, callback) {

  var params;

  // just checking
  if(!event.group_id) {
    callback("No group id given");
  }
  if(!event.customer_email && !event.customer_username) {
    callback("No customer email or username given");
  }

  if(event.customer_email) {
    params = {
      ExpressionAttributeValues: {
        ":given_group_id": {
          "N": event.group_id.toString()
        },
        ":given_email": {
          "S": event.customer_email
        }
      },
      ExpressionAttributeNames: {
        "#gid": "group_id",
        "#e": "email"
      },
      KeyConditionExpression: "#gid = :given_group_id AND #e = :given_email",
      ProjectionExpression: "customer_id",
      TableName: "customers",
      IndexName: "email-index"
    };
  }

  if(event.customer_username) {
    params = {
      ExpressionAttributeValues: {
        ":given_group_id": {
          "N": event.group_id.toString()
        },
        ":given_username": {
          "S": event.customer_username
        }
      },
      ExpressionAttributeNames: {
        "#gid": "group_id",
        "#u": "username"
      },
      KeyConditionExpression: "#gid = :given_group_id AND #u = :given_username",
      ProjectionExpression: "customer_id",
      TableName: "customers",
      IndexName: "username-index"
    };
  }

  dynamodb.query(params, function(err, data) {
    if(err) {
      callback(err);
    } else {
      if(data.Items.length === 0) {
        callback(null, "User does not exist");
      } else {
        params = {
          ExpressionAttributeNames: {
            "#email": "email",
            "#username": "username",
            "#password": "password"
          },
          Key: {
            "group_id": {
              "N": event.group_id.toString()
            },
            "customer_id": {
              "N": data.Items[0].customer_id.N.toString()
            }
          },
          TableName: "customers",
          UpdateExpression: "REMOVE #email, #username, #password"
        };

        dynamodb.updateItem(params, function(err, uData) {
          if(err) {
            callback(err);
          } else {
            callback(null, {
              "comments": "Online user deleted"
            });
          }
        });
      }
    }
  });

};
