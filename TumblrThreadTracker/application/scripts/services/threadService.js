﻿'use strict';
var rpThreadTracker = rpThreadTracker || {};
rpThreadTracker.services.service('threadService', [
    '$q', '$http', function($q, $http) {
        var subscribers = [],
            subscribersOnComplete = [],
            subscribersOnArchiveUpdate = [],
            threads = [],
            archivedThreads = [];

        function getThreadIds(isArchived) {
            var deferred = $q.defer(),
                config = {
                    url: '/api/Thread?isArchived=' + isArchived,
                    method: 'GET'
                },
                success = function (response) {
                    if (response) {
                        deferred.resolve(response.data);
                    } else {
                        deferred.resolve(null);
                    }
                },
                error = function(data) {
                    deferred.reject(data);
                };
            $http(config).then(success).catch(error);
            return deferred.promise;
        }

        function getThreads(force) {
            if (threads.length > 0 && !force) {
                broadcast(threads);
                return;
            }

            broadcast(threads);
            threads = [];
            var queue = [];
            getThreadIds(false).then(function(ids) {
                angular.forEach(ids, function(value, key) {
                    queue.push(getThread(value));
                });
                $q.all(queue).then(function(results) {
                    broadcastOnComplete();
                });
            });
        };

        function getArchive(force) {
            if (archivedThreads.length > 0 && !force) {
                broadcastOnArchiveUpdate(archivedThreads);
                return;
            }
            broadcastOnArchiveUpdate(archivedThreads);
            archivedThreads = [];
            var queue = [];
            getThreadIds(true).then(function (ids) {
                angular.forEach(ids, function (value, key) {
                    queue.push(getThread(value));
                });
                $q.all(queue).then(function (results) {
                    broadcastOnComplete();
                });
            });
        }

        function getThread(id) {
            var deferred = $q.defer(),
                config = {
                    url: '/api/Thread/' + id,
                    method: 'GET'
                },
                success = function (response) {
                    if (response.data.IsArchived == false) {
                        threads.push(response.data);
                        broadcast(threads);
                    } else {
                        archivedThreads.push(response.data);
                        broadcastOnArchiveUpdate(archivedThreads);
                    }
                    deferred.resolve(true);
                };
            $http(config).then(success);
            return deferred.promise;
        };

        function getStandaloneThread(id) {
            var deferred = $q.defer(),
                config = {
                    url: '/api/Thread/' + id,
                    method: 'GET'
                },
                success = function(response) {
                    deferred.resolve(response.data);
                },
                error = function(response) {
                    deferred.reject(response.data);
                };
            $http(config).then(success).catch(error);
            return deferred.promise;
        };

        function flushThreads() {
            threads = [];
            archivedThreads = [];
        }

        function addNewThread(blogShortname, postId, userTitle, watchedShortname) {
            var deferred = $q.defer(),
                config = {
                    url: '/api/Thread',
                    method: "POST",
                    data: {
                        PostId: postId,
                        BlogShortname: blogShortname,
                        UserTitle: userTitle,
                        watchedShortname: watchedShortname
                    }
                },
                success = function(response, status, headers, config) {
                    deferred.resolve(response.data);
                },
                error = function(response, status, headers, config) {
                    deferred.reject(response);
                };
            $http(config).then(success).catch(error);
            return deferred.promise;
        }

        function editThreads(threadsToEdit, archiveValue) {
            var deferred = $q.defer();
            var queue = [],
            success = function (response, status, headers, config) {
                deferred.resolve(response.data);
            },
               error = function (response, status, headers, config) {
                   deferred.reject(response);
               };
            angular.forEach(threadsToEdit, function (value, key) {
                queue.push(editThread(value.UserThreadId, value.BlogShortname, value.PostId, value.UserTitle, value.WatchedShortname, archiveValue));
            });
            $q.all(queue).then(success).catch(error);
            return deferred.promise;
        }

        function editThread(userThreadId, blogShortname, postId, userTitle, watchedShortname, isArchived) {
            var deferred = $q.defer(),
                config = {
                    url: '/api/Thread',
                    method: "PUT",
                    data: {
                        UserThreadId: userThreadId,
                        PostId: postId,
                        BlogShortname: blogShortname,
                        UserTitle: userTitle,
                        WatchedShortname: watchedShortname,
                        IsArchived: isArchived
                    }
                },
                success = function(response, status, headers, config) {
                    deferred.resolve(response.data);
                },
                error = function(response, status, headers, config) {
                    deferred.reject(response);
                };
            $http(config).then(success).catch(error);
            return deferred.promise;
        }

        function untrackThreads(userThreadIds) {
            var queryString = "";
            angular.forEach(userThreadIds, function (id) {
                queryString += "userThreadIds=" + id + "&";
            });
            queryString.slice(1,queryString.length - 2);
            var deferred = $q.defer(),
                config = {
                    url: '/api/Thread?' + queryString,
                    method: "DELETE"
                },
                success = function(response, status, headers, config) {
                    deferred.resolve(response.data);
                },
                error = function(response, status, headers, config) {
                    deferred.reject(response);
                };
            $http(config).then(success).catch(error);
            return deferred.promise;
        }

        function subscribe(callback) {
            subscribers.push(callback);
        }

        function subscribeOnComplete(callback) {
            subscribersOnComplete.push(callback);
        }

        function subscribeOnArchiveUpdate(callback) {
            subscribersOnArchiveUpdate.push(callback);
        }

        function unsubscribe(callback) {
            var index = subscribers.indexOf(callback);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        }

        function unsubscribeOnComplete(callback) {
            var index = subscribersOnComplete.indexOf(callback);
            if (index > -1) {
                subscribersOnComplete.splice(index, 1);
            }
        }

        function unsubscribeOnArchiveUpdate(callback) {
            var index = subscribersOnArchiveUpdate.indexOf(callback);
            if (index > -1) {
                subscribersOnArchiveUpdate.splice(index, 1);
            }
        }

        function broadcast(data) {
            angular.forEach(subscribers, function(callback, key) {
                callback(data);
            });
        }

        function broadcastOnComplete() {
            angular.forEach(subscribersOnComplete, function(callback, key) {
                callback();
            });
        }

        function broadcastOnArchiveUpdate(data) {
            angular.forEach(subscribersOnArchiveUpdate, function (callback, key) {
                callback(data);
            });
        }

        return {
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            subscribeOnComplete: subscribeOnComplete,
            unsubscribeOnComplete: unsubscribeOnComplete,
            subscribeOnArchiveUpdate: subscribeOnArchiveUpdate,
            unsubscribeOnArchiveUpdate: unsubscribeOnArchiveUpdate,
            getThreads: getThreads,
            getArchive: getArchive,
            getStandaloneThread: getStandaloneThread,
            addNewThread: addNewThread,
            editThread: editThread,
            editThreads: editThreads,
            untrackThreads: untrackThreads,
            flushThreads: flushThreads
        };
    }
]);