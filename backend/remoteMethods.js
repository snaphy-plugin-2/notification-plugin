/**
 * Created by robins on 1/6/17.
 */
(function () {
   "use strict";
    const Promise = require("bluebird");
    const process = require("process");

    module.exports = function (server, databaseObj, helper, packageObj) {
        const init = function () {
            sendNotificationMethod();
            changeStatusMethod();
        };

        //TODO: Disable all other methods except given methods of notification

        /**
         * Send Notification method
         */
        const sendNotificationMethod = function () {
            const Notification = databaseObj.Notification;

            Notification.send = function (notificationData, callback) {
                sendNotification(notificationData)
                    .then(function (notification) {
                        callback(null, notification);
                    })
                    .catch(function (error) {
                        callback(error);
                    });
            };

            Notification.remoteMethod(
                "send",
                {
                    description: 'Method to send notification to admin panel.',
                    accepts: [
                        { arg: 'notificationData', type: 'object', required: true}
                    ],
                    returns: {
                        arg: 'notification', type: 'SnaphyNotification', root: true,
                        description: "Sends back a notification object."
                    },
                    http: {verb: 'post'}
                }
            );
        };



        /**
         * Method to send notification..
         * @param notification
         * @returns {bluebird}
         */
        const sendNotification = function (notification) {
           return new Promise(function (resolve, reject) {
               Notification.create(notification)
                   .then(function (data) {
                        resolve(data);
                   })
                   .catch(function (error) {
                       reject(error);
                   });
           });
        };



        /**
         * changeStatusMethod of Notification
         */
        const changeStatusMethod = function () {
            const Notification = databaseObj.Notification;

            Notification.changeStatus = function (notificationId, status, callback) {
                changeStatus(notificationId, status)
                    .then(function (result) {
                        callback(null, result);
                    })
                    .catch(function (error) {
                        callback(error);
                    });
            };

            Notification.remoteMethod(
                "changeStatus",
                {
                    description: 'Method to change status of notification to admin panel.',
                    accepts: [
                        { arg: 'notificationData', type: 'object', required: true}
                    ],
                    returns: {
                        arg: 'status', type: 'string', root: true,
                        description: "Change the status of notification."
                    },
                    http: {verb: 'post'}
                }
            );
        };



        /**
         * Method to send notification..
         * @param notificationId
         * @param status
         * @returns {bluebird}
         */
        const changeStatus = function (notificationId, status) {
           return new Promise(function (resolve, reject) {
               status = status?status.trim().toLowerCase() : "";

               if(notificationId && status){
                   var isStatusValid = status.indexOf(["read", "unread"]);
                   if(isStatusValid === -1){
                       process.nextTick(function () {
                           reject(new Error("Status is invalid."));
                       });
                   }else{
                       Notification.updateAll(
                           {
                               id: notificationId
                           },
                           {
                               status: status
                           })
                           .then(function (data) {
                               resolve(data);
                           })
                           .catch(function (error) {
                               reject(error);
                           });
                   }

               }else{
                   process.nextTick(function () {
                        reject(new Error("Data is invalid."));
                   });
               }
           });
        };




        return{
          init: init
        }
    };
})();