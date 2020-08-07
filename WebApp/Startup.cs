using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Data;
using Servicios;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Modelos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using System.Security.Claims;
using Westwind.AspNetCore.LiveReload;

namespace WebApp
{
    public class Startup
    {
        private readonly IWebHostEnvironment env;
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            this.env = env;
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLiveReload(config =>
            {
                config.FolderToMonitor = env.ContentRootPath + "\\Views";
            });
            services.AddSignalR();
            services.AddRazorPages().AddRazorRuntimeCompilation();
            services.AddMvc().AddRazorRuntimeCompilation();

            services.AddDbContext<RChanContext>(options =>
                options.UseNpgsql(
                    Configuration.GetConnectionString("DefaultConnection")));

            // services.AddDefaultIdentity<UsuarioModel>(options => options.SignIn.RequireConfirmedAccount = false)
            //     .AddEntityFrameworkStores<RChanContext>();

            services.AddDefaultIdentity<UsuarioModel>(opt =>
            {
                opt.Password.RequireDigit = false;
                opt.Password.RequiredUniqueChars = 0;
                opt.Password.RequireLowercase = false;
                opt.Password.RequireNonAlphanumeric = false;
                opt.Password.RequireUppercase = false;
            })
                .AddSignInManager()
                .AddEntityFrameworkStores<RChanContext>();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("esAdmin", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim("Role", "admin");
                });
                options.AddPolicy("esMod", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim("Role", "admin mod".Split(" "));
                });
                options.AddPolicy("esJanitor", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim("Role", "admin mod janitor".Split(" "));
                });
            });
            //services.AddRazorPages();
            services.AddMvc();

            services.AddScoped<IHiloService, HiloService>();
            services.AddScoped<IComentarioService, ComentarioService>();
            // services.AddScoped<IUsuarioService, UsuarioService>();
            services.AddScoped<HashService>();
            services.AddScoped<IMediaService, MediaService>(s =>
            {
                var env = s.GetService<IWebHostEnvironment>();
                return new MediaService(Path.Combine(env.ContentRootPath, "Almacenamiento"), s.GetService<RChanContext>());
            });

            services.AddCors(options =>
            {
                options.AddPolicy("",
                builder =>
                {
                    builder.WithOrigins("http://localhost:8080/")
                                        .AllowAnyHeader()
                                        .AllowAnyMethod();
                });
            });

            //services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
                app.UseLiveReload();

            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            void ConfigurarCache(StaticFileResponseContext ctx)
            {
                if (!env.IsDevelopment())
                {
                    ctx.Context.Response.Headers.Append(
                        "Cache-Control", $"public, max-age={31536000}");
                }
            }

            app.UseStaticFiles(
                new StaticFileOptions { OnPrepareResponse = ConfigurarCache }
            );
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "Almacenamiento")
                ),
                OnPrepareResponse = ConfigurarCache
            });

            app.UseRouting();
            app.UseCors();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Hilo}/{action=Index}/{id?}"
                );
                endpoints.MapHub<RChanHub>("/hub");
            });
        }
    }

    public static class Extensiones
    {
        public static bool EsAdmin(this ClaimsPrincipal user)
        {
            return user.HasClaim("Role", "admin");
        }
        public static bool EsMod(this ClaimsPrincipal user)
        {
            return user.HasClaim("Role", "mod")
                || user.HasClaim("Role", "admin");
        }
        public static bool EsJanitor(this ClaimsPrincipal user)
        {
            return user.HasClaim("Role", "mod")
                || user.HasClaim("Role", "admin")
                || user.HasClaim("Role", "janitor");
        }
        public static string GetId(this ClaimsPrincipal user)
        {
            return user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? null;
        }

    }
}
