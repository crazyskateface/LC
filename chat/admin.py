from django.contrib import admin
from chat.models import UserProfile, Comments, Roll, Emblem
# Register your models here.



class UserProfileAdmin(admin.ModelAdmin):
    fields = ('user','ign','isMod','banned','verified','primRole','secRole','tier','division')
admin.site.register(UserProfile,UserProfileAdmin)

class CommentsAdmin(admin.ModelAdmin):
    fields = ('user','text','datetime')
admin.site.register(Comments,CommentsAdmin)

class RollAdmin(admin.ModelAdmin):
    fields = ('name',)
admin.site.register(Roll, RollAdmin)

class EmblemAdmin(admin.ModelAdmin):
    fields = ('name', 'url',)
admin.site.register(Emblem, EmblemAdmin)