// Expected input:
// group_id, customer_id, customer_name (Required)
// customer_address, customer_phone_number (Optional)

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
var _ = require("underscore");

exports.handler = function(event, context, callback) {

  var params;

    console.log(event);
  // just checking
  if(!event.group_id) {
    callback("No group_id given");
  }

  if(!event.customer_id) {
    callback("No customer id given");
  }

  if(!event.customer_name) {
    callback("No customer name given");
  }

  params = {
    ExpressionAttributeNames: {
      "#customer_id": "customer_id"
    },
    Item: {
      "group_id": {
        "N": event.group_id.toString()
      },
      "customer_id": {
        "N": event.customer_id.toString()
      },
      "name": {
        "S": event.customer_name.toString()
      },
      "credits": {
        "N": "0"
      }
    },
    ConditionExpression: "attribute_not_exists(#customer_id)",
    TableName: "customers"
  };

  if(event.customer_phone_number) {
    params.Item.phone_number = {
      "N": event.customer_phone_number.toString()
    };
  }

  if(event.customer_address) {
    params.Item.address = {
      "S": event.customer_address
    };
  }

  dynamodb.putItem(params, function(err, put_item_data) {
    if(err) {
      callback("User already exists");
    } else {
      callback(null, {
        "comments": "User added"
      });
    }
  });


};
