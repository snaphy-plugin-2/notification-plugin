'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {

    const remoteMethods = require("./remoteMethods")(server, databaseObj, helper, packageObj);

	/**
	 * Here server is the main app object
	 * databaseObj is the mapped database from the package.json file
	 * helper object contains all the helpers methods.
	 * packegeObj contains the packageObj file of your plugin. 
	 */

	/**
	 * Initialize the plugin at time of server start.
	 * init method should never have any argument
	 * It is a constructor and is populated once the server starts.
	 * @return {[type]} [description]
	 */
	var init = function(){
        remoteMethods.init();
	};



	//return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init,
        sendNotification: remoteMethods.sendNotification
	}
}; //module.exports
