'use strict';
module.exports = function( server, databaseObj, helper, packageObj) {

	const Promise       = require("bluebird");
    const remoteMethods = require("./remoteMethods")(server, databaseObj, helper, packageObj);
    //const mongo                = require("mongodb");
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



    /**
	 * Get the roles from the list..
     * @param data
     * @param request
     * @returns {*}
     */
	const getRoles = function (data, request) {
		return new Promise(function (resolve, reject) {
			if(data.acl){
				if(data.acl.length){
					return resolve(data.acl);
				}
			}

            const login = helper.loadPlugin("login");
            login.getRoles(server, request, function (error, rolesList) {
                if(error){
                	reject(error);
				}else{
                    if (rolesList) {
                        data.acl = rolesList;
                    }
                    resolve(data.acl);
				}
            });
        });
    };



    /**
	 * Get filter Object
     * @param request
     * @param data
     * @param type
     * @param roles
     */
	const getFilter = function (request, data, type, roles) {
        return new Promise(function (resolve, reject) {
            const filter = {};
            filter[packageObj.NOTIFICATION_TYPE.read] = {
                filter:{
                    limit: 100,
                    order: "added DESC",
                    where:{
                        status: packageObj.NOTIFICATION_TYPE.read
                    }
                }
            };

            filter[packageObj.NOTIFICATION_TYPE.unread] = {
                filter:{
                    limit: 100,
                    order: "added DESC",
                    where:{
                        status: packageObj.NOTIFICATION_TYPE.unread
                    }
                }
            };

            const typeFilter =  Object.assign({}, filter[type]);
            //Add more filter a/c to filter provided in the data..
            const rolesFilter = packageObj.filter;
            if(roles){
                if(roles.length){
                	let targetRole;
                    for(var roleName in rolesFilter){
                        if(rolesFilter.hasOwnProperty(roleName)){
                            const isFound = roles.indexOf(roleName);
                            if(isFound !== -1){
                                targetRole = roleName;
                                break;
                            }
                        }
                    }

                    if(targetRole){
                        //Add filter to data..
                        const where = Object.assign({}, rolesFilter[roleName]);
                        modifyWhere(request, where, typeFilter)
                            .then(function (filter) {
                                resolve(filter);
                            })
                            .catch(function (error) {
                                reject(error);
                            });
					}else{
						return resolve(typeFilter);
					}
                }else{
                    return resolve(typeFilter);
				}
            }else{
                return resolve(typeFilter);
			}
        });
    };


    /**
	 * Modify where query..
     * @param request
     * @param where
     * @param typeFilter
     */
	const modifyWhere = function(request, where, typeFilter){
		return new Promise(function (resolve, reject) {
			//First find the current logged user..
			if(request){
				if(request.accessToken){
					if(request.accessToken.userId){
						const userId = request.accessToken.userId;
						if(userId){
                            databaseObj.User.findById(userId)
								.then(function (user) {
                                    addWhereToFilter(where, typeFilter, user);
                                    resolve(typeFilter);
                                })
								.catch(function (error) {
									reject(error);
                                });
						}else{
                            addWhereToFilter(where, typeFilter);
                            resolve(typeFilter);
						}
					}else{
                        addWhereToFilter(where, typeFilter);
                        resolve(typeFilter);
					}
				}else{
                    addWhereToFilter(where, typeFilter);
                    resolve(typeFilter);
				}
			}else{
                addWhereToFilter(where, typeFilter);
                resolve(typeFilter);
			}
        });
	};



    /**
	 * Add Where Query to filter..
     * @param where
     * @param filter
     * @param user
     * @returns {filter.where|{status}|{type}|{role}|*|{}}
     */
	const addWhereToFilter = function (where, filter, user) {
		filter.filter               = filter.filter || {};
		filter.filter.where         = filter.filter.where || {};
		if(where){
            for(var key in where){
				if(where.hasOwnProperty(key)){
					let modifyData = false;
					if(user){
                        let value = where[key];
                        const patt = /\$user\..+/;
                        if(patt.test(value)){
                            const valueKey = value.replace(/\$user\./, '');
                            where[key] = user[valueKey];
                            modifyData = true;
                        }
					}

					const whereKey = `options.${key}`;
					filter.filter.where[whereKey] = where[key];

				}
            }
		}
		return filter.filter.where;
    };



    /**
     * Load static data to database..
     * @param req
     * @param state
     * @param data
     */
    const getStaticData = function (req, state, data) {
        return new Promise(function (resolve, reject) {
        	let roleList;
            getRoles(data, req)
				.then(function (roles) {
					roleList = roles;
					const type = packageObj.NOTIFICATION_TYPE.read;
                    return getFilter(req, data, type, roleList);
                })
				.then(function (filter) {
                    const Notification = databaseObj.Notification;
                    return Notification.find(filter.filter);
                })
				.then(function (notificationList) {
					//Add Read notification List..
					data.notification = data.notification || {};
					data.notification[packageObj.NOTIFICATION_TYPE.read] = notificationList;
                    //Find unread type notification
					const type = packageObj.NOTIFICATION_TYPE.unread;
                    return getFilter(req, data, type, roleList);
                })
				.then(function (filter) {
                    const Notification = databaseObj.Notification;
                    return Notification.find(filter.filter);
                })
				.then(function (notificationList) {
                    data.notification = data.notification || {};
                    data.notification[packageObj.NOTIFICATION_TYPE.unread] = notificationList;
                })
				.then(function () {
					resolve();
                })
				.catch(function (error) {
					reject(error);
                });
        });
    };




    //return all the methods that you wish to provide user to extend this plugin.
	return {
		init: init,
        getStaticData: getStaticData,
        sendNotification: remoteMethods.sendNotification
	}
}; //module.exports
