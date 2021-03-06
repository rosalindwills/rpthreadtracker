﻿namespace RPThreadTracker.Controllers
{
	using System;
	using System.Linq;
	using System.Net;
	using System.Net.Http;
	using System.Security.Claims;
	using System.Web.Http;
	using Infrastructure.Filters;
	using Interfaces;
	using Models.DomainModels.Threads;
	using Models.DomainModels.Users;
	using Models.RequestModels;

	/// <summary>
	/// Controller class for getting and updating user information
	/// </summary>
	[RedirectOnMaintenance]
	[Authorize]
	public class UserController : ApiController
	{
		private readonly IRepository<User> _userProfileRepository;
		private readonly IThreadService _threadService;
		private readonly IRepository<Thread> _threadRepository;
		private readonly IUserProfileService _userProfileService;
		private readonly IWebSecurityService _webSecurityService;

		/// <summary>
		/// Initializes a new instance of the <see cref="UserController"/> class
		/// </summary>
		/// <param name="webSecurityService">Unity-injected web security service</param>
		/// <param name="userProfileService">Unity-injected user profile service</param>
		/// <param name="userProfileRepository">Unity-injected user profile repository</param>
		/// <param name="threadService">Unity-injected thread service</param>
		/// <param name="threadRepository">Unity-injected thread repository</param>
		public UserController(IWebSecurityService webSecurityService, IUserProfileService userProfileService, IRepository<User> userProfileRepository, IThreadService threadService, IRepository<Thread> threadRepository)
		{
			_webSecurityService = webSecurityService;
			_userProfileService = userProfileService;
			_userProfileRepository = userProfileRepository;
			_threadService = threadService;
			_threadRepository = threadRepository;
		}

		/// <summary>
		/// Controller endpoint for getting the currently authenticated user
		/// </summary>
		/// <returns><see cref="UserDto"/> object describing requested user</returns>
		public IHttpActionResult Get()
		{
			var user = _webSecurityService.GetCurrentUserFromIdentity((ClaimsIdentity)User.Identity, _userProfileRepository);
			return Ok(user);
		}

		/// <summary>
		/// Controller endpoint for creating new UserProfile accounts
		/// </summary>
		/// <param name="request">Request body containing new account information</param>
		/// <returns>ActionResult object wrapping HTTP response</returns>
		[HttpPost]
		[AllowAnonymous]
		public IHttpActionResult Post(RegisterRequest request)
		{
			var usernameExists = _userProfileService.GetUserByUsername(request.Username, _userProfileRepository) != null;
			var emailExists = _userProfileService.GetUserByEmail(request.Email, _userProfileRepository) != null;
			if (usernameExists || emailExists)
			{
				return BadRequest("An account with some or all of this information already exists.");
			}
			var createdAccount = _webSecurityService.CreateAccount(request.Username, request.Password, request.Email, _userProfileRepository);
			return CreatedAtRoute("DefaultApi", new { }, createdAccount);
		}

		/// <summary>
		/// Controller endpoint for updating the currently authenticated user
		/// </summary>
		/// <param name="user">Request body containing information about user to be updated</param>
		/// <returns>ActionResult object wrapping HTTP response</returns>
		public IHttpActionResult Put(UserDto user)
		{
			if (user == null)
			{
				return BadRequest();
			}
			var currentUser = _webSecurityService.GetCurrentUserFromIdentity((ClaimsIdentity)User.Identity, _userProfileRepository);
			if (currentUser.UserId != user.UserId)
			{
				return BadRequest();
			}
			_userProfileService.Update(user, _userProfileRepository);

			if (!user.AllowMarkQueued)
			{
				_threadService.ClearAllMarkedQueuedForUser(user.UserId, _threadRepository);
			}
			return Ok();
		}

		/// <summary>
		/// Controller endpoint for changing password of currently authenticated user
		/// </summary>
		/// <param name="model">Request body containing information about password change</param>
		/// <returns>ActionResult object wrapping HTTP response</returns>
		[Route("api/User/Password")]
		[HttpPut]
		public IHttpActionResult ChangePassword(ChangePasswordRequest model)
		{
			var user = _webSecurityService.GetCurrentUserFromIdentity((ClaimsIdentity)User.Identity, _userProfileRepository);
			var success = _webSecurityService.ChangePassword(user.UserName, model.OldPassword, model.NewPassword);
			if (!success)
			{
				return BadRequest();
			}
			return Ok();
		}
	}
}