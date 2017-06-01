'use strict';

angular.module($snaphy.getModuleName())
    .filter('elapsed', function($filter){
        return function(date){
            if (!date) return;
            var time = Date.parse(date),
                difference = (new Date()) - time;

            // Seconds (e.g. 32s)
            difference /= 1000;
            if (difference < 60) return Math.floor(difference)+' sec ago';

            // Minutes (e.g. 12m)
            difference /= 60;
            if (difference < 60) return Math.floor(difference)+' min ago';

            // Hours (e.g. 5h)
            difference /= 60;
            if (difference < 24) return Math.floor(difference)+' hours ago';

            // Date (e.g. Dec 2)
            return $filter('date')(time, 'MMM d');
        };
    });

//Define your filter specific for this plugin.