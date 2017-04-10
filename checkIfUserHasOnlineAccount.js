// Expected input:  group_id, customer_id (Required)
// Checks if user already has an online account(attributes email, username or
// password exist)

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
var _ = require('underscore');

exports.handler = function(event, context, callback) {

  var params;

  // just checking
  if(!event.group_id) {
    callback("No group id given");
  }
  if(!event.customer_id) {
    callback("No customer id given");
  }

  params = {
    Key: {
      "group_id": {
        "N": event.group_id.toString()
      },
      "customer_id": {
        "N": event.customer_id.toString()
      }
    },
    TableName: "customers"
  };

  dynamodb.getItem(params, function(err, data) {
    if(err) {
      callback(err);
    } else {
      if(_.isEmpty(data)) {
        callback("User id not found");
      } else {
        if(data.Item.email) {
          callback(null, {
            "exists": true,
            "comments": "User is already registered"
          });
        } else {
          callback(null, {
            "exists": false,
            "comments": "User is not registered"
          });
        }
      }
    }
  });

};
