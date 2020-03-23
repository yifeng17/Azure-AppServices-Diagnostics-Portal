// <copyright file="ObserverServiceCollectionExtensions.cs" company="Microsoft Corporation">
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
// </copyright>

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AppLensV3.Helpers
{
    /// <summary>
    /// Extension methods for setting up Observer services in an Microsoft.Extensions.DependencyInjection.IServiceCollection.
    /// </summary>
    public static class ObserverServiceCollectionExtensions
    {
        /// <summary>
        /// Adds Observer as a service.
        /// </summary>
        /// <param name="services">The Microsoft.Extensions.DependencyInjection.IServiceCollection to add services to</param>
        /// <param name="configuration">The configuration class which may holds configuration data for Observer.</param>
        /// <returns>The Microsoft.Extensions.DependencyInjection.IServiceCollection so that additional calls can be chained.</returns>
        public static IServiceCollection AddObserver(this IServiceCollection services, IConfiguration configuration)
        {
            if (configuration.GetValue("Observer:diagnosticObserverEnabled", false))
            {
                services.AddSingleton<IObserverClientService, DiagnosticObserverClientService>();
            }
            else
            {
                services.AddSingleton<IObserverClientService, SupportObserverClientService>();
            }

            return services;
        }
    }
}
