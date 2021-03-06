﻿namespace RPThreadTracker.Controllers
{
	using System.Threading.Tasks;
	using System.Web.Http;
	using Infrastructure.Filters;
	using Interfaces;
	using Models.DomainModels.Account;
	using Models.DomainModels.Users;

	/// <summary>
	/// Controller class for handling forgot password flow
	/// </summary>
	[RedirectOnMaintenance]
	public class ForgotPasswordController : ApiController
	{
		private readonly IEmailClient _emailClient;
		private readonly IRepository<User> _userProfileRepository;
		private readonly IRepository<Membership> _webpagesMembershipRepository;
		private readonly IUserProfileService _userProfileService;
		private readonly IConfigurationService _configurationService;
		private readonly IWebSecurityService _webSecurityService;

		/// <summary>
		/// Initializes a new instance of the <see cref="ForgotPasswordController"/> class
		/// </summary>
		/// <param name="userProfileRepository">Unity-injected user profile repository</param>
		/// <param name="webpagesMembershipRepository">Unity-injected WebpagesMembership repository</param>
		/// <param name="webSecurityService">Unity-injected web security service</param>
		/// <param name="emailClient">Unity-injected email service</param>
		/// <param name="userProfileService">Unity-injected user profile service</param>
		/// <param name="configurationService">Unity-injected configuration service</param>
		public ForgotPasswordController(IRepository<User> userProfileRepository, IRepository<Membership> webpagesMembershipRepository, IWebSecurityService webSecurityService, IEmailClient emailClient, IUserProfileService userProfileService, IConfigurationService configurationService)
		{
			_userProfileRepository = userProfileRepository;
			_webpagesMembershipRepository = webpagesMembershipRepository;
			_webSecurityService = webSecurityService;
			_emailClient = emailClient;
			_userProfileService = userProfileService;
			_configurationService = configurationService;
		}

		/// <summary>
		/// Controller endpoing requesting a new password be assigned to account
		/// </summary>
		/// <param name="usernameOrEmail">
		/// Identifier used to find account to be reset
		/// </param>
		/// <returns>ActionResult object wrapping HTTP response</returns>
		[HttpPost]
		[AllowAnonymous]
		public async Task<IHttpActionResult> Post([FromBody] string usernameOrEmail)
		{
			if (usernameOrEmail == null)
			{
				return BadRequest();
			}
			var user = _userProfileService.GetUserByUsername(usernameOrEmail, _userProfileRepository)
			           ?? _userProfileService.GetUserByEmail(usernameOrEmail, _userProfileRepository);
			if (user == null)
			{
				return BadRequest();
			}
			var token = _webSecurityService.GeneratePasswordResetToken(user);
			await _webSecurityService.SendForgotPasswordEmail(user, token, _webpagesMembershipRepository, _emailClient, _configurationService);
			return Ok();
		}
	}
}