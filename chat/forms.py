from chat.models import UserProfile
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms


class UserForm(UserCreationForm):
    

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2')
        
class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('primRole','secRole')
        
        
        
        
        
        
