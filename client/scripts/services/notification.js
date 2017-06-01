'use strict';

angular.module($snaphy.getModuleName())
//Define your services here..

    .factory('NotificationService', ["Database", "$timeout", function(Database, $timeout) {

        /**
         * Load Notification..
         */
        var loadNotification = function (type) {
            var Notification = Database.getDb("notification", "Notification");
            var filter;
            if(type === "unread"){
                filter = settings.get().options.unread.filter;
            }else{
                filter = settings.get().options.read.filter;
            }
            
            Notification.find({filter:filter}, function (value, responseHeader) {
                if(type === "unread"){
                    $timeout(function () {
                        settings.get().unread.length = 0;
                        angular.copy(value, settings.get().unread);
                    }, 0);

                }else{
                    $timeout(function () {
                        settings.get().read.length = 0;
                        angular.copy(value, settings.get().read);
                    }, 0);
                }
            }, function (error) {
               console.error(error);
            });
        };

        /**
         * Initialize settings for notification..
         * @returns {{}}
         */
        var initSettings = function () {
            return{
                options:{
                  unread:{
                      filter:{
                          limit: 100,
                          where:{
                              status:"unread"
                          }
                      }
                  },
                  read:{
                      filter:{
                          limit: 10,
                          where:{
                              status:"read"
                          }
                      }
                  }
                },
                unread:[],
                read:[]
            };
        };



        /**
         * Creating memoization method for settings..
         * @returns {function}
         */
        var configSettings = function(){
            var settings;
            return {
                get: function(){
                    if(!settings){
                        this.reset();
                    }
                    return settings;
                },
                reset: function(){
                    settings = initSettings(settings);
                },

                clear: function(){
                    //Clear settings value..
                }
            };

        };



        /**
         * return memoization function..
         * @type {{get, reset}|Function}
         */
        var settings = configSettings();

        return {
            settings: settings,
            loadNotification: loadNotification

        };
    }]);

