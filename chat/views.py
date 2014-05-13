from chat.models import Comments, User, UserProfile
from chat.verify import ver_ign
from django.shortcuts import render, render_to_response
from django.template import RequestContext, loader
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
from operator import attrgetter
from chat.forms import  UserProfileForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, REDIRECT_FIELD_NAME, logout


import redis

@login_required(login_url="/login/")
def home(request):
    prof = UserProfile.objects.get(user=request.user)
    comments = Comments.objects.select_related().all().order_by('-datetime')[:100]
    comments = sorted(comments,key=attrgetter('datetime'))
    return render(request, 'chat/home.html', locals())

@login_required(login_url="/login/")
def verify(request, ign):
    
    content = ver_ign(ign)
    prof = UserProfile.objects.get(user=request.user)
    #print(content)
    prof.verified = content
    print(prof.verified)
    if content:
        prof.ign = ign
        print(prof.ign)
    prof.save()
    return render(request, 'chat/profile.html', locals())


@csrf_exempt
def node_api(request):
    try:
        #Get User from sessionid
        session = Session.objects.get(session_key=request.POST.get('sessionid'))
        user_id = session.get_decoded().get('_auth_user_id')
        user = User.objects.get(id=user_id)
        prof = UserProfile.objects.get(user=user)

        #Create comment
        Comments.objects.create(user=user, text=request.POST.get('comment'))
        
        #Once comment has been created post it to the chat channel
        r = redis.StrictRedis(host='localhost', port=6379, db=0)
        r.publish('chat', prof.ign + ': ' + request.POST.get('comment'))   #user.username
        
        return HttpResponse("Everything worked :)")
    except Exception, e:
        return HttpResponseServerError(str(e))
    
@login_required(login_url="/login/")
def prof(request):
    prof = UserProfile.objects.get(user=request.user)
    return render(request, 'chat/profile.html', locals())

def user_prof(request, uname):
                                                                                    # CHECK IF PROFILE EXISTS
    userProf = UserProfile.objects.get(ign=uname)
    return render(request, 'chat/user.html', {'userprof':userProf})



# CREATE USER PROFILE BRUH
def register(request):
    context = RequestContext(request)
    
    
    registered = False
    
    #if POST DATA
    if request.method == 'POST':
        # attempt to grab info from the raw form info
        user_form = UserCreationForm(data=request.POST)
        #profile_form = UserProfileForm(data=request.POST)
        
        #if the two forms have valid data ...
        if user_form.is_valid():
            #save the user's form data to the database
            user = user_form.save()
            #user = User()
            #user.username = request.POST['username']
            #user.password = request.POST['password1']
            #hash the password
            #user.set_password(user.password)
            #user.save()
            user.save()
            # sort out the user profile instance
            # commit=false delays saving the instance until we're ready ! :D
            profile = UserProfile()
            profile.user = user
            
            # did the user provide a 
            profile.ign = 'guest-'+user.username
            
            
            profile.save()
            
            registered = True
            usera = authenticate(username=request.POST['username'], password=request.POST['password1'])
            login(request, usera)
            print(profile.ign+' logged in')
            return HttpResponseRedirect('/profile/')
        #invalid form
        #print problems
        else:
            print user_form.errors
    
    #not a POST
    #blank forms
    else:
        #user_form = UserCreationForm()
        user_form = UserCreationForm()
        
    return render_to_response(
            'chat/register.html',
            { 'user_form':user_form, 'registered':registered},
            context)
            
# log the balls in    
def loginz(request):
    context = RequestContext(request)
    
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        
        user = authenticate(username=username, password=password)
        
        if user:
            if user.is_active:
                # if the account is valid and active we cna log the user in
                
                login(request, user)
                return HttpResponseRedirect('/')
            else:
                return HttpResponse("Your account is disabled? wtf..")
            
        else:
            # bad login creds
            print "Invalid login creds: {0}, {1}".format(username, password)
            return HttpResponse("Invalid shit balls")
    else:
        return render_to_response('chat/login.html', {}, context)
    
@login_required(login_url="/login/")
def logoutz(request):
    logout(request)
    
    return HttpResponseRedirect('/login/')
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    


