﻿namespace RPThreadTrackerTests.Helpers
{
	using RPThreadTracker.Models.DomainModels.Blogs;

	internal class BlogBuilder
	{
		private int _userId = 1;
		private int? _userBlogId = 1;
		private string _blogShortname = "TestBlog";
		private bool _onHiatus = false;

		public Blog Build()
		{
			return new Blog
			{
				UserId = _userId,
				UserBlogId = _userBlogId,
				BlogShortname = _blogShortname,
				OnHiatus = _onHiatus
			};
		}

		public BlogDto BuildDto()
		{
			return new BlogDto
			{
				UserId = _userId,
				UserBlogId = _userBlogId,
				BlogShortname = _blogShortname,
				OnHiatus = _onHiatus
			};
		}

		public BlogBuilder WithUserId(int userId)
		{
			_userId = userId;
			return this;
		}

		public BlogBuilder WithUserBlogId(int? userBlogId)
		{
			_userBlogId = userBlogId;
			return this;
		}

		public BlogBuilder WithBlogShortname(string blogShortname)
		{
			_blogShortname = blogShortname;
			return this;
		}

		public BlogBuilder WithOnHiatus(bool onHiatus)
		{
			_onHiatus = onHiatus;
			return this;
		}
	}
}
