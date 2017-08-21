'use strict';

angular.module($snaphy.getModuleName())
//Define your services here..

    .factory('NotificationService', ["Database", "$timeout", "$rootScope", "$window",
        function(Database, $timeout, $rootScope, $window) {

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

            const globalNotification = $window.STATIC_DATA.notification;
            if(globalNotification[type]){
                var value = globalNotification[type];
                if(type === "unread"){
                    $timeout(function () {
                        settings.get().unread.length = 0;
                        //angular.copy(value, settings.get().unread);
                        settings.get().options.unread.total = value.length;
                        value.forEach(function (notification) {
                            var obj = initNotification(notification);
                            //Add a notification..
                            settings.get().unread.push(obj);
                        });
                        $rootScope.$broadcast('setNotification', { unread: settings.get().options.unread.total });
                    }, 0);

                }else{
                    $timeout(function () {
                        settings.get().read.length = 0;
                        //angular.copy(value, settings.get().read);
                        $rootScope.notification.read.total = value.length;
                        value.forEach(function (notification) {
                            var obj = initNotification(notification);
                            //Add a notification..
                            settings.get().read.push(obj);
                        });
                    }, 0);
                }
            }else{
                Notification.find({filter:filter}, function (value, responseHeader) {
                    if(type === "unread"){
                        $timeout(function () {
                            settings.get().unread.length = 0;
                            //angular.copy(value, settings.get().unread);
                            settings.get().options.unread.total = value.length;
                            value.forEach(function (notification) {
                                var obj = initNotification(notification);
                                //Add a notification..
                                settings.get().unread.push(obj);
                            });
                            $rootScope.$broadcast('setNotification', { unread: settings.get().options.unread.total });
                        }, 0);

                    }else{
                        $timeout(function () {
                            settings.get().read.length = 0;
                            //angular.copy(value, settings.get().read);
                            $rootScope.notification.read.total = value.length;
                            value.forEach(function (notification) {
                                var obj = initNotification(notification);
                                //Add a notification..
                                settings.get().read.push(obj);
                            });
                        }, 0);
                    }
                }, function (error) {
                    console.error(error);
                });
            }
        };


        /**
         * Initialize notification object
         * @param notificationObj
         * @returns {{data: {}, changeStatus: changeStatus, setRead: setRead, setUnRead: setUnRead}}
         */
        var initNotification = function (notificationObj) {
            var notification = {
                data: {},
                changeStatus: function (status) {
                    var  that = this;
                    var Notification = Database.getDb("notification", "Notification");
                    var oldStatus = that.status;
                    if(oldStatus !== that.data.status){
                        notification.data.status = status;
                        if(status === "read"){
                            settings.get().options.unread.total--;
                        }

                        if(status === "unread"){
                            settings.get().options.unread.total++;
                        }

                        if(settings.get().options.unread.total < 0){
                            settings.get().options.unread.total = 0;
                        }

                        $rootScope.$broadcast('setNotification', { unread: settings.get().options.unread.total });
                        Notification.changeStatus({}, {notificationId: that.data.id, status: status},
                            function (notification) {
                                //Change status to read..
                            }, function (error) {
                                notification.data.status = oldStatus;
                                $rootScope.$broadcast('setNotification', { unread: settings.get().options.unread.total });
                            });
                    }

                },
                setRead: function () {
                    this.changeStatus("read");
                },
                setUnRead: function () {
                    this.changeStatus("unread");
                },
                toggleStatus: function () {
                    if(this.data.status === "read"){
                        this.changeStatus("unread");
                    }else{
                        this.changeStatus("read");
                    }
                }
            };
            if(notificationObj){
                angular.copy(notificationObj, notification.data);
                if(notification.data.status === "read"){
                    notification.isChecked = true;
                }else{
                    notification.isChecked = false;
                }

            }
            return notification;
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
                      },
                      total: 0
                  },
                  read:{
                      filter:{
                          limit: 10,
                          where:{
                              status:"read"
                          }
                      },
                      total: 0
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
                    settings = initSettings();
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

