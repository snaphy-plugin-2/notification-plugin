'use strict';

angular.module($snaphy.getModuleName())

//Controller for notificationControl ..
.controller('notificationControl', ['$scope', '$stateParams', "NotificationService",
    function($scope, $stateParams, NotificationService) {
        //Checking if default templating feature is enabled..
        var defaultTemplate = $snaphy.loadSettings('notification', "defaultTemplate");
        $snaphy.setDefaultTemplate(defaultTemplate);
        //Use Database.getDb(pluginName, PluginDatabaseName) to get the Database Resource.

        $scope.settings         = NotificationService.settings.get();
        $scope.loadNotification = NotificationService.loadNotification;



    }//controller function..
]);