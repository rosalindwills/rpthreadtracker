﻿'use strict';
(function() {
	angular.module('rpthreadtracker')
		.controller('DashboardController',
		[
			'$scope', '$controller', '$location', 'threadService', 'contextService',
			'blogService', 'newsService', 'sessionService', 'pageId', 'NOTIFICATION_TYPES',
			'notificationService', 'BodyClass', '$mdDialog', dashboardController
		]);

	/** @this dashboardController */
	// eslint-disable-next-line valid-jsdoc, max-params, max-len, max-statements
	function dashboardController($scope, $controller, $location, threadService, contextService, blogService, newsService, sessionService, pageId, NOTIFICATION_TYPES, notificationService, BodyClass, $mdDialog) {
		var vm = this;
		angular.extend(vm, $controller('BaseController as base', {'$scope': $scope}));
		sessionService.loadUser(vm);
		BodyClass.set('');

		initScopeValues();
		initScopeDataValues();
		initSubscriptions();
		initScopeFunctions();
		$scope.$on('$destroy', destroyView);

		function initScopeValues() {
			vm.pageId = pageId;
			vm.dashboardFilter = 'yourturn';
			vm.showAtAGlance = false;
			vm.loadingRandomThread = false;
		}

		function initScopeDataValues() {
			vm.threads = [];
			vm.blogs = [];
			vm.noThreads = false;
			vm.noBlogs = false;
			sessionService.getUser().then(function(user) {
				vm.showAtAGlance = user.ShowDashboardThreadDistribution;
			});
			blogService.getBlogs().then(function(blogs) {
				vm.blogs = blogs;
				if (vm.blogs.length === 0)				{
					vm.noBlogs = true;
				}
			});
			newsService.getNews().then(function(news) {
				vm.news = news;
			});
		}

		function initScopeFunctions() {
			vm.untrackThreads = untrackThreads;
			vm.archiveThreads = archiveThreads;
			vm.onThreadLoaded = onThreadLoaded;
			vm.refreshThreads = refreshThreads;
			vm.setDashboardFilter = setDashboardFilter;
			vm.toggleAtAGlanceData = toggleAtAGlanceData;
			vm.generateRandomOwedThread = generateRandomOwedThread;
			vm.markQueued = markQueued;
		}

		function initSubscriptions() {
			threadService.subscribeLoadedThreadEvent(onThreadLoaded);
			threadService.subscribeAllThreadsLoaded(onAllThreadsLoaded);
			threadService.loadThreads();
		}

		function onThreadLoaded(data) {
			vm.noThreads = false;
			vm.threads = data;
			vm.myTurnCount = _.filter(vm.threads, function(thread) {
				return thread.IsMyTurn && !thread.MarkedQueued;
			}).length;
			vm.theirTurnCount = _.filter(vm.threads, function(thread) {
				return !thread.IsMyTurn && !thread.MarkedQueued;
			}).length;
			vm.queuedCount = _.filter(vm.threads, function(thread) {
				return thread.MarkedQueued;
			}).length;
		}
		function onAllThreadsLoaded() {
			if (vm.threads.length === 0) {
				vm.noThreads = true;
			}
		}

		function refreshThreads() {
			threadService.flushThreads();
			threadService.loadThreads();
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

		function markQueued(threads) {
			vm.loading = true;
			threadService.markThreadsQueued(threads).then(function () {
				vm.loading = false;
				refreshThreads();
				var type = NOTIFICATION_TYPES.QUEUE_THREAD_SUCCESS;
				notificationService.show(type, { 'threads': threads });
			}, function () {
				vm.loading = false;
				var type = NOTIFICATION_TYPES.QUEUE_THREAD_FAILURE;
				notificationService.show(type);
			});
		}

		function setDashboardFilter(filterString) {
			vm.dashboardFilter = filterString;
		}

		function toggleAtAGlanceData() {
			if (!vm.user) {
				return;
			}
			vm.user.ShowDashboardThreadDistribution = vm.showAtAGlance;
			sessionService.updateUser(vm.user);
		}

		function generateRandomOwedThread() {
			if (!vm.threads) {
				return;
			}
			vm.loadingRandomThread = true;
			vm.randomlyGeneratedThread = null;
			var options = _.filter(vm.threads, function(thread) {
				return thread.IsMyTurn && !thread.MarkedQueued;
			});
			vm.randomlyGeneratedThread = _.sample(options);
			vm.loadingRandomThread = false;
		}

		function destroyView() {
			threadService.unsubscribeLoadedThreadEvent(onThreadLoaded);
		}
	}
}());
