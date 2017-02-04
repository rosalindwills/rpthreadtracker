﻿namespace TumblrThreadTracker.Infrastructure
{
	using System;
	using System.Collections.Generic;
	using System.Threading.Tasks;
	using System.Web.Http.Dependencies;

	using Microsoft.Practices.Unity;

	public class UnityResolver : IDependencyResolver
	{
		protected IUnityContainer Container;

		public UnityResolver(IUnityContainer container)
		{
			if (container == null) throw new ArgumentNullException("container");
			Container = container;
		}

		public IDependencyScope BeginScope()
		{
			var child = Container.CreateChildContainer();
			return new UnityResolver(child);
		}

		public void Dispose()
		{
			try
			{
				Container.Dispose();
			}
			catch (TaskCanceledException e)
			{
				var ex = e;
			}
		}

		public object GetService(Type serviceType)
		{
			try
			{
				return Container.Resolve(serviceType);
			}
			catch (ResolutionFailedException)
			{
				return null;
			}
		}

		public IEnumerable<object> GetServices(Type serviceType)
		{
			try
			{
				return Container.ResolveAll(serviceType);
			}
			catch (ResolutionFailedException)
			{
				return new List<object>();
			}
		}
	}
}