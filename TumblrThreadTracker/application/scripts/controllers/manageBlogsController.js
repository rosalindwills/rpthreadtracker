﻿'use strict';
var rpThreadTracker = rpThreadTracker || {};
rpThreadTracker.controllers.controller('ManageBlogsController', [
    '$scope', '$location', 'sessionService', 'blogService', 'threadService', 'pageId', function($scope, $location, sessionService, blogService, threadService, pageId) {
        $scope.setBodyClass('');

        function success() {
            $scope.newBlogForm.$setPristine();
            $scope.newBlogShortname = '';
            $scope.showSuccessMessage = true;
            blogService.flushBlogs();
            threadService.flushThreads();
            blogService.getBlogs().then(function(blogs) {
                $scope.blogs = blogs;
            });
        }

        function failure() {
            $scope.genericError = "There was a problem updating your blogs.";
            $scope.showSuccessMessage = false;
        }

        $scope.createBlog = function() {
            if ($scope.newBlogShortname != '') {
                blogService.createBlog($scope.newBlogShortname).then(success).catch(failure);
            }
        };
        $scope.untrackBlog = function(userBlogId) {
            blogService.untrackBlog(userBlogId).then(success).catch(failure);
        };
        $scope.pageId = pageId;
        blogService.getBlogs().then(function(blogs) {
            $scope.blogs = blogs;
        });
        sessionService.getUser().then(function(user) {
            $scope.userId = user.UserId;
            $scope.user = user;
        });
    }
]);