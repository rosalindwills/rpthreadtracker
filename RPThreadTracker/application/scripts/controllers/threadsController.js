﻿'use strict';
(function() {
	angular.module('rpthreadtracker')
		.controller('ThreadsController',
		[
			'$scope', '$controller', '$window', 'threadService', 'contextService',
			'blogService', 'newsService', 'sessionService', 'pageId', 'notificationService',
			'NOTIFICATION_TYPES', 'BodyClass', 'THREAD_BULK_ACTIONS', '$mdDialog', threadsController
		]);

	/** @this dashboardController */
	// eslint-disable-next-line valid-jsdoc, max-params, max-len, max-statements
	function threadsController($scope, $controller, $window, threadService, contextService, blogService, newsService, sessionService, pageId, notificationService, NOTIFICATION_TYPES, BodyClass, THREAD_BULK_ACTIONS, $mdDialog) {
		var vm = this;
		angular.extend(vm, $controller('BaseController as base', {'$scope': $scope}));
		sessionService.loadUser(vm);
		BodyClass.set('');

		initScopeValues();
		initSubscriptions();
		initScopeFunctions();
		$scope.$on('$destroy', destroyView);

		function initScopeValues() {
			vm.pageId = pageId;
			vm.currentBlog = contextService.getCurrentBlog();
			vm.sortDescending = contextService.getSortDescending();
			vm.currentOrderBy = contextService.getCurrentOrderBy();
			vm.filteredTag = contextService.getFilteredTag();
			vm.bulkItemAction = THREAD_BULK_ACTIONS.UNTRACK;
			vm.threads = [];
			vm.blogs = [];
			blogService.getBlogs().then(function(blogs) {
				vm.blogs = blogs;
			});
		}

		function initScopeFunctions() {
			vm.setCurrentBlog = setCurrentBlog;
			vm.setSortDescending = setSortDescending;
			vm.setCurrentOrderBy = setCurrentOrderBy;
			vm.setFilteredTag = setFilteredTag;
			vm.untrackThreads = untrackThreads;
			vm.archiveThreads = archiveThreads;
			vm.unarchiveThreads = unarchiveThreads;
			vm.refreshThreads = refreshThreads;
			vm.bulkAction = bulkAction;
			vm.buildPublicLink = buildPublicLink;
		}

		function initSubscriptions() {
			threadService.subscribeLoadedThreadEvent(loadThreads);
			threadService.subscribeLoadedArchiveThreadEvent(loadThreads);
			if (vm.pageId === 'archived') {
				threadService.loadArchivedThreads();
			} else {
				threadService.loadThreads();
			}
		}

		function loadThreads(data) {
			vm.threads = data;
			populateTagFilter();
		}

		function refreshThreads() {
			threadService.flushThreads();
			if (vm.pageId === 'archived') {
				threadService.loadArchivedThreads(true);
			} else {
				threadService.loadThreads(true);
			}
		}

		function untrackThreads(threads) {
			var message = 'This will untrack ';
			message += threads.length;
			message += ' thread(s) from your account. Continue?';
			var confirm = $mdDialog.confirm()
				.title('Untrack Thread(s)')
				.textContent(message)
				.ok('Yes')
				.cancel('Cancel');
			$mdDialog.show(confirm).then(function() {
				vm.loading = true;
				threadService.untrackThreads(threads).then(function() {
					vm.loading = false;
					refreshThreads();
					var type = NOTIFICATION_TYPES.UNTRACK_THREAD_SUCCESS;
					notificationService.show(type, {'threads': threads});
				},
				function() {
					vm.loading = false;
					var type = NOTIFICATION_TYPES.UNTRACK_THREAD_FAILURE;
					notificationService.show(type);
				});
			});
		}

		function archiveThreads(threads) {
			vm.loading = true;
			threadService.archiveThreads(threads).then(function() {
				vm.loading = false;
				refreshThreads();
				var type = NOTIFICATION_TYPES.ARCHIVE_THREAD_SUCCESS;
				notificationService.show(type, {'threads': threads});
			}, function() {
				vm.loading = false;
				var type = NOTIFICATION_TYPES.ARCHIVE_THREAD_FAILURE;
				notificationService.show(type);
			});
		}

		function unarchiveThreads(threads) {
			vm.loading = true;
			threadService.unarchiveThreads(threads).then(function() {
				vm.loading = false;
				refreshThreads();
				var type = NOTIFICATION_TYPES.UNARCHIVE_THREAD_SUCCESS;
				notificationService.show(type, {'threads': threads});
			}, function() {
				vm.loading = false;
				var type = NOTIFICATION_TYPES.UNARCHIVE_THREAD_FAILURE;
				notificationService.show(type);
			});
		}

		function setCurrentBlog() {
			contextService.setCurrentBlog(vm.currentBlog);
			populateTagFilter();
		}

		function setSortDescending() {
			contextService.setSortDescending(vm.sortDescending);
		}

		function setCurrentOrderBy() {
			contextService.setCurrentOrderBy(vm.currentOrderBy);
		}

		function setFilteredTag() {
			contextService.setFilteredTag(vm.filteredTag);
		}

		function bulkAction() {
			var bulkAffected = _.filter(vm.threads, function(thread) {
				return thread.SelectedForBulk;
			});
			if (vm.bulkItemAction === THREAD_BULK_ACTIONS.UNTRACK) {
				vm.untrackThreads(bulkAffected);
			} else if (vm.bulkItemAction === THREAD_BULK_ACTIONS.ARCHIVE) {
				vm.archiveThreads(bulkAffected);
			} else if (vm.bulkItemAction === THREAD_BULK_ACTIONS.UNARCHIVE) {
				vm.unarchiveThreads(bulkAffected);
			}
		}

		function populateTagFilter() {
			var tagsByThread = _.map(vm.threads, 'ThreadTags');
			vm.allTags = _.union(_.flatten(tagsByThread));
			if (!_.find(vm.allTags, function(tag) { return tag === vm.filteredTag })) {
				vm.filteredTag = '';
			}
		}

		function buildPublicLink() {
			var url = $window.location.origin;
			url += '/public/' + vm.pageId;
			url += '?userId=' + (vm.user ? vm.user.UserId : '');
			url += '&currentBlog=' + (vm.currentBlog ? vm.currentBlog.BlogShortname : '');
			url += '&sortDescending=' + vm.sortDescending;
			url += '&currentOrderBy=' + vm.currentOrderBy;
			url += '&filteredTag=' + vm.filteredTag;
			return url;
		}

		function destroyView() {
			threadService.unsubscribeLoadedThreadEvent(loadThreads);
			threadService.unsubscribeLoadedArchiveThreadEvent(loadThreads);
		}
	}
}());
