from chat.models import Comments, User, UserProfile, Emblem
from chat.verify import ver_ign
from chat.twitch import get_twitch_user
from django.shortcuts import render, render_to_response, get_object_or_404
from django.template import RequestContext, loader
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
from django.contrib.auth.decorators import login_required
from operator import attrgetter
from chat.forms import  UserProfileForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, REDIRECT_FIELD_NAME, logout
from tasks import add

import redis


rooms = ['lobby', 'duos']


def home(request):
    #prof = UserProfile.objects.get(user=request.user)
    
    #comments = Comments.objects.select_related().all().order_by('-datetime')[:100]
    #comments = sorted(comments,key=attrgetter('datetime'))
    
    return render(request, 'chat/home.html', locals())

@login_required(login_url="/login/")
def chat(request):
    prof = UserProfile.objects.get(user=request.user)
    chat = True
    comments = Comments.objects.select_related().all().order_by('-datetime')[:100]
    comments = sorted(comments,key=attrgetter('datetime'))
    
    return render(request, 'chat/chat.html', locals())


def room(request, room):
    if room not in rooms:
        room = 'lobby'
    prof = UserProfile.objects.get(user=request.user)
    comments = Comments.objects.select_related().all().order_by('-datetime')[:100]
    comments = sorted(comments,key=attrgetter('datetime'))
    
    return render(request, 'chat/'+room+'.html', locals())

@login_required(login_url="/login/")
def verify(request, ign):
    
    prof = UserProfile.objects.get(user=request.user)
    
    if UserProfile.objects.filter(ign=ign).exists():
        contents = True
        return render(request, 'chat/profile.html', locals())
    
    content = ver_ign(ign)
    
    #print(content)
    if content['verified'] == None:
        finders = True
        return render(request, 'chat/profile.html', {'finders':finders, 'prof':prof})
    prof.verified = content['verified']
    if content['verified']:
        prof.ign = ign
        print(prof.ign)
        if content['tier'] != "":
            prof.tier = content['tier']
        divisions = {'I':1,'II':2,'III':3,'IV':4,'V':5}
        div = content['division']
        if div != "":
            prof.division = divisions[div]
        
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

@csrf_exempt
def node_emblem(request):
    try:
        session = Session.objects.get(session_key=request.POST.get('sessionid'))
        user_id = session.get_decoded().get('_auth_user_id')
        user = User.objects.get(id=user_id)
        prof = UserProfile.objects.get(user=user)
        #Debug.log('suck')
        emblem = Emblem.objects.get(name=prof.tier)
        list_of_info = str(prof.tier)+':'+str(prof.division)+':'+str(prof.primRole)+':'+str(prof.secRole)
        embAndInfo = str(emblem)+':'+str(list_of_info)
        return HttpResponse(str(embAndInfo))
    except Exception, e:
        print('suck')
        return HttpResponseServererror(str(e))
        
         

@login_required(login_url="/login/")
def prof(request):
    context = RequestContext(request)
    prof = UserProfile.objects.get(user=request.user)
    nice = False
    #if POST DATA
    if request.method == 'POST':
        print(prof.ign)
        # attempt to grab info from the raw form info
        print('into the posting')
        prof_form = UserProfileForm(data=request.POST, instance=prof)
        #profile_form = UserProfileForm(data=request.POST)
        changed = False
        guests = UserProfile.objects.filter(ign__endswith='guest-'+request.POST['ign'])
        c = len(guests)+1
        
        # if changing the ign need to set verified = false 
        if(request.POST['ign'] != prof.ign):
            prof.verified = False
            changed = True
            #if the two forms have valid data ...
        if prof_form.is_valid():
            
            if changed == True:
                prof.ign = str(c)+'guest-' +prof_form.cleaned_data['ign']
            
            prof.primRole = prof_form.cleaned_data['primRole']
            prof.secRole = prof_form.cleaned_data['secRole']
            
            prof.save()
            nice = True
        else:
            print(prof_form.errors)
    else:
        prof_form = UserProfileForm(instance=prof)
        
    return render_to_response(
            'chat/profile.html',
            locals(),
            context)
            

def search(request, uname):
    userProf = None
    users = None                                   
        
    userProf = UserProfile.objects.filter(ign=uname)
    
        
    try:
        userlist = UserProfile.objects.filter(ign__icontains=uname)
    except userlist.DoesNotExist:
        users = None
    return render(request, 'chat/search.html', locals())


def user_prof(request, uname):                          
    try:
        userProf = UserProfile.objects.get(ign=uname)
    except:
        userProf = None

    return render(request, 'chat/user.html', locals())

#
# CREATE USER PROFILE BRUH
def register(request):
    context = RequestContext(request)
    if request.user.is_authenticated():
        return HttpResponseRedirect("/chat/")
    
    
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
            
            profile.verified = False;
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
            
def twitchAuth(request):
    code = request.GET.get('code','')
    username = ''
    user = ''
    if code != '':
        username = get_twitch_user(code)
    
        if username != '':
            # have username so if exists login if not register dat hoe
            try:
                user = User.objects.get(username=username)
            except:
                pass
            if user != '':
                #user is in system...login!!!
                if user.is_active:
                    
                    user = authenticate(username=username,nope='yes') #auth w/ no pass
                    login(request, user)
                    return HttpResponseRedirect('/')
                else:
                    return HttpResponse(username +' is not working')
            else:
                #user is not in system ...register dat hoe
                
                user_obj = User()
                user_obj.username = username
                user_obj.set_password = code
                user_obj.save()
                ign = 'guest-'+username
                profile = UserProfile()
                profile.user = user_obj
                
                # did the user provide a 
                profile.ign = 'guest-'+user_obj.username
                
                profile.verified = False;
                profile.save()
                
#                 registered = True
                usera = authenticate(username=user_obj.username, password=code)
                login(request, usera)
#                 print(profile.ign+' logged in')
                return HttpResponseRedirect('/profile/')
            
    else:
        return HttpResponse("code didn't work dummy")
            
            
            
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
            errors = "invalid login credentials"
            return render_to_response('chat/login.html',{'errors':errors}, context)
    else:
        return render_to_response('chat/login.html', {}, context)
    
@login_required(login_url="/login/")
def logoutz(request):
    logout(request)
    
    return HttpResponseRedirect('/login/')



def training(request):
    return render("chat/training.html", {}, RequestContext(request))

def leaderboard(request):
    return render("chat/leaderboard.html", {}, RequestContext(request))
    
    
def handler404(request):
    return render(request, '404.html')

def terms(request):
    return render(request,'terms.html')

def privacy(request):
    return render(request, 'privacy.html')
    

    


