// Expected Input:
// group_id
// customer_id
// store_id
//
// products: An array containing the products purchased.
// Each item in products array has two attributes: product_id, quantity
//
// Callbacks are named according to the function to which they belong
// callback is for the handler function
// callbackArraysOfProducts is for the eachSeries function for arraysOfProducts
// callbackSmallArray is for the eachSeries function for smallArray

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
var async = require('async');
var _ = require('underscore');

var batchSize = 2;

exports.handler = function(event, context, callback) {

  var params;
  var arraysOfProducts = [];
  var credits = 0;

  // split array of products to arrays with max length = batchSize
  while(event.products.length > batchSize) {
    arraysOfProducts.push(event.products.splice(0, batchSize));
  }

  arraysOfProducts.push(event.products.splice(0, event.products.length));

  async.eachSeries(arraysOfProducts, function(smallArray, callbackArraysOfProducts) {

    params = {
      RequestItems: {
        "products": {
          Keys: [],
          ProjectionExpression: "product_id, credits_to_subtract"
        }
      }
    };

    // for each item inside inner array push id to params
    // and when done, call batchGetItem
    async.eachSeries(smallArray, function(item, callbackSmallArray) {
      params.RequestItems.products.Keys.push(
        {
          "store_id": {
            "N": event.store_id.toString()
          },
          "product_id": {
            "N": item.product_id.toString()
          }
        }
      );
      callbackSmallArray(null);
    }, function(err) {
      if(err) {
        callbackArraysOfProducts(err);
      } else {
        dynamodb.batchGetItem(params, function(err, data) {
          if(err) {
            callbackArraysOfProducts(err);
          } else {
            // add to credits
            async.eachSeries(data.Responses.products, function(item, callbackItem) {
              var quantity = smallArray.find(function(element) {
                return (element.product_id == item.product_id.N);
              }).quantity;
              credits += item.credits_to_subtract.N * quantity;
              callbackItem(null);
            }, function(err) {
              if(err) {
                callbackArraysOfProducts(err);
              } else {
                callbackArraysOfProducts(null);
              }
            });
          }
        }); // end of batchGetItem
      }
    });// end of callback for eachSeries for smallArray
  }, function(err) { // end of eachSeries for arraysOfProducts and callback:
    if(err) {
      callback(err);
    } else {

      // update customer credits in db
      params = {
        Key: {
          "group_id" : {
            "N": event.group_id.toString()
          },
          "customer_id": {
            "N": event.customer_id.toString()
          }
        },
        TableName: "customers",
        ExpressionAttributeValues: {
          ":c": {
              "N": credits.toString()
          }
        },
        ConditionExpression: "credits >= :c",
        UpdateExpression: "SET credits = credits - :c"
      };

      dynamodb.updateItem(params, function(err, data) {
        if(err) {
          callback(err);
        } else {
          callback(null, {"comments": "Subtracted " + credits + " credits"});
        }
      });
    }
  });
};
