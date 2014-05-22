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
        fields = ('ign','primRole','secRole')
        
    def clean_ign(self):
        ign = self.cleaned_data['ign']
        
        if UserProfile.objects.exclude(pk=self.instance.pk).filter(ign=ign).exists():
            raise forms.ValidationError(u'Summoner name already in use: %(ign)s',
                                        code='invalid',
                                        params={'ign': ign},
                                        )
        return ign

        
        
        
