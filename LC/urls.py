from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'chat.views.home', name='home'),
    url(r'^chat/$', 'chat.views.chat', name='chat'),
    url(r'^room/(?P<room>\w+)/$','chat.views.room', name='room'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^node_api$', 'chat.views.node_api', name='node_api'),
    url(r'^node_emblem$','chat.views.node_emblem',name='node_emblem'),
    #url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'admin/login.html'}, name='login'),
    url(r'^logout/$', 'chat.views.logoutz',  name='logoutz'),
    url(r'^profile/$', 'chat.views.prof', name='prof'),
    url(r'^user/(?P<uname>\w+)/$', 'chat.views.user_prof', name='user_prof'),
    url(r'^user/(?P<uname>\d*guest-\w+)','chat.views.user_prof',name='user_prof'),
    url(r'^search/(?P<uname>\w+)/$', 'chat.views.search', name='search'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^register/$', 'chat.views.register', name='register'),
    url(r'^login/$', 'chat.views.loginz', name='loginz'),
    url(r'^verify/(?P<ign>\w+)/$', 'chat.views.verify', name='verify'),
    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^training/$','chat.views.training',name='training'),
    url(r'^leaderboard/$', 'chat.views.leaderboard', name='leaderboard'),
    url(r'^twitchAuth', 'chat.views.twitchAuth', name='twitchAuth'),
    url(r'^terms/$', 'chat.views.terms', name='terms'),
    url(r'^privacy/$', 'chat.views.privacy', name='privacy'),
    url(r'^msg/$', 'chat.views.msg', name='msg'),
    url(r'^msg/(?P<serial_number>[\d\w]{8})/$','chat.views.msgt',name='msgt'),
    #url("", include('django_socketio.urls')),
    
)


handler404 = 'chat.views.handler404'