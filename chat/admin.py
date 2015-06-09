from django.contrib import admin

from chat.models import UserProfile, Comments, Roll, Emblem
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
# Register your models here.



class UserProfileAdmin(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User'
    fields = ('user','ign','isMod','banned','verified','primRole','secRole','tier','division')
    
class MyUserCreationForm(UserCreationForm):
 
    def clean_username(self):
        # Since User.username is unique, this check is redundant,
        # but it sets a nicer error message than the ORM. See #13147.
        username = self.cleaned_data["username"]
        try:
            User._default_manager.get(username=username)
        except User.DoesNotExist:
            return username
        raise forms.ValidationError(self.error_messages['duplicate_username'])
     
    class Meta(UserCreationForm.Meta):
        model = User

class UserAdmin(UserAdmin):
    add_form = MyUserCreationForm
    inlines = (UserProfileAdmin, )
    
admin.site.unregister(User)   
admin.site.register(User, UserAdmin)

class CommentsAdmin(admin.ModelAdmin):
    fields = ('user','text','datetime')
admin.site.register(Comments,CommentsAdmin)

class RollAdmin(admin.ModelAdmin):
    fields = ('name',)
admin.site.register(Roll, RollAdmin)


class EmblemAdmin(admin.ModelAdmin):
    fields = ('name', 'url',)
admin.site.register(Emblem, EmblemAdmin)

 
# class MyUserAdmin(UserAdmin): 
#     add_form = MyUserCreationForm
#     
# admin.site.register(UserProfile, MyUserAdmin)
