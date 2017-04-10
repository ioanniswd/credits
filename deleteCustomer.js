// Expected input:
// group_id, customer_id

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

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
    TableName: "customers",
    ConditionExpression: "attribute_exists(group_id)"
  };

  dynamodb.deleteItem(params, function(err, data) {
    if(err) {
      callback(err);
    } else {
      callback(null, {
        "comments": "Success"
      });
    }
  });
};
