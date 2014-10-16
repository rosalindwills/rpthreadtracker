﻿using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using TumblrThreadTracker.Domain.Blogs;
using TumblrThreadTracker.Domain.Threads;
using TumblrThreadTracker.Interfaces;
using TumblrThreadTracker.Models;
using TumblrThreadTracker.Models.RequestModels;
using TumblrThreadTracker.Repositories;
using TumblrThreadTracker.Services;
using WebMatrix.WebData;

namespace TumblrThreadTracker.Controllers
{
    [Authorize]
    public class ThreadController : ApiController
    {
        private readonly IUserBlogRepository _blogRepository;
        private readonly IUserThreadRepository _threadRepository;
        private static int _userId;

        public ThreadController()
        {
            _blogRepository = new UserBlogRepository(new ThreadTrackerContext());
            _threadRepository = new UserThreadRepository(new ThreadTrackerContext());
            _userId = WebSecurity.GetUserId(User.Identity.Name);
        }

        // GET api/<controller>
        public ThreadDto Get(int id)
        {
            return Thread.GetById(id, _blogRepository, _threadRepository);
        }

        public IEnumerable<int?> Get()
        {
            var ids = new List<int?>();
            var blogs = Blog.GetBlogsByUserId(_userId, _blogRepository);
            foreach (var blog in blogs)
            {
                ids.AddRange(Thread.GetThreadIdsByBlogId(blog.UserBlogId, _threadRepository));
            }
            return ids;
        }

        // POST api/<controller>
        public void Post(ThreadUpdateRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException();
            }
            var blog = Blog.GetBlogByShortname(request.BlogShortname, _userId, _blogRepository);
            var dto = new ThreadDto
            {
                UserThreadId = null,
                PostId = request.PostId,
                BlogShortname = request.BlogShortname,
                UserBlogId = blog.UserBlogId != null ? blog.UserBlogId.Value : -1,
                UserTitle = request.UserTitle,
                WatchedShortname = request.WatchedShortname
            };
            Thread.AddNewThread(dto, _threadRepository);
        }

        // PUT api/<controller>/5
        public void Put(ThreadUpdateRequest request)
        {
            if (request == null || request.UserThreadId == null)
            {
                throw new ArgumentNullException();
            }
            var blog = Blog.GetBlogByShortname(request.BlogShortname, _userId, _blogRepository);
            var dto = new ThreadDto
            {
                UserThreadId = request.UserThreadId,
                PostId = request.PostId,
                BlogShortname = request.BlogShortname,
                UserBlogId = blog.UserBlogId != null ? blog.UserBlogId.Value : -1,
                UserTitle = request.UserTitle,
                WatchedShortname = request.WatchedShortname
            };
            Thread.UpdateThread(dto, _threadRepository);
        }

        // DELETE api/<controller>/5
        public void Delete(int userThreadId)
        {
            _threadRepository.DeleteUserThread(userThreadId);
        }
    }
}