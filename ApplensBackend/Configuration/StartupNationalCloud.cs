using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.WsFederation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Tokens.Saml2;

namespace AppLensV3.Configuration
{
    /// <summary>
    /// Startup class for production national cloud. Runtime will use this class when ASPNETCORE_ENVIRONMENT = NationalCloud.
    /// </summary>
    public class StartupNationalCloud
    {
        private readonly IConfiguration configuration;
        private readonly IHostingEnvironment env;

        /// <summary>
        /// Initializes a new instance of the <see cref="StartupNationalCloud"/> class.
        /// </summary>
        /// <param name="configuration">DI Configuration.</param>
        public StartupNationalCloud(IConfiguration configuration, IHostingEnvironment env)
        {
            this.configuration = configuration;
            this.env = env;
        }

        /// <summary>
        /// Automatically called by the runtime by convention to setup services for the app.
        /// </summary>
        /// <param name="services">services.</param>
        public virtual void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<IDiagnosticClientService, DiagnosticRoleClient>();
            services.AddSingleton<IObserverClientService, DiagnosticObserverClientService>();
            services.AddMemoryCache();

            if (env.IsEnvironment("NationalCloud"))
            {
                services.AddMvc();
                services.AddAuthentication(options =>
                {
                    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = WsFederationDefaults.AuthenticationScheme;
                })
                .AddWsFederation(options =>
                {
                    options.MetadataAddress = configuration["DatacenterFederationConfiguration:MetadataAddress"];
                    options.Wtrealm = configuration["DatacenterFederationConfiguration:Realm"];
                    options.ClaimsIssuer = configuration["DatacenterFederationConfiguration:Issuer"];
                    options.SecurityTokenHandlers = new List<ISecurityTokenValidator> { new Saml2SecurityTokenHandler() };
                })
                .AddCookie();
            }
            else
            {
                services.AddMvc(setup =>
                {
                    setup.Filters.Add(new AllowAnonymousFilter());
                });
            }
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseCors(cors =>
                cors
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowAnyOrigin()
                .WithExposedHeaders(new string[] { "diag-script-etag" }));

            if (env.IsEnvironment("NationalCloud"))
            {
                app.UseAuthentication();
            }

            app.UseMvc();

            app.Use(async (context, next) =>
            {
                await next();
                if (context.Response.StatusCode == 404 &&
                    !Path.HasExtension(context.Request.Path.Value) &&
                    !context.Request.Path.Value.StartsWith("/api/"))
                {
                    context.Request.Path = "/index.html";
                    await next();
                }
            });

            app.UseDefaultFiles();
            app.UseStaticFiles();
        }
    }
}
