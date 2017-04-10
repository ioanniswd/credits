// Expected input:
// store_id, product_id

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context, callback) {
  var params;

  // just checking
  if(!event.store_id) {
    callback("No store id given");
  }
  if(!event.product_id) {
    callback("No product id given");
  }

  params = {
    Key: {
      "store_id": {
        "N": event.store_id.toString()
      },
      "product_id": {
        "N": event.product_id.toString()
      }
    },
    TableName: "products",
    ConditionExpression: "attribute_exists(store_id)"
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
