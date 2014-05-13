from django.db import models
from django.contrib.auth.models import User


# Create your models here.

class Comments(models.Model):
    user = models.ForeignKey(User)
    text = models.CharField(max_length=255)
    datetime = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['datetime']
        
        
class Roll(models.Model):
    name = models.CharField(max_length=20)
    
    def __unicode__(self):
        return self.name        

def get_role():
    return Roll.objects.get(id=1)

class UserProfile(models.Model):
    user = models.ForeignKey(User, unique=True)
#     email = models.EmailField(max_length=100)
    ign = models.CharField(max_length=75, unique=True)
    verified = models.BooleanField(blank=True, default=False)
    isMod = models.BooleanField(blank=True, default=False)
    banned = models.BooleanField(blank=True, default=False)
    primRole = models.ForeignKey(Roll,  related_name="primary", default=get_role)
    secRole = models.ForeignKey(Roll,  related_name="secondary",default=get_role)
    #api data
    tier = models.CharField(blank=True, max_length=20)
    division = models.IntegerField(blank=True, null=True)
    
    def __unicode__(self):
        return self.user.username
    
    
    

    