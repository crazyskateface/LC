import urllib
import urllib2
import requests
import json


def get_twitch_user(code):

    page = 'https://api.twitch.tv/kraken/oauth2/token' 

    values = {
                'client_id': 'iqme1phzcvouk0zuvo68pob2fghzwf1',
                'client_secret':'p3ojlqigc29k0jm0degiqzea3he0yyt',
                'grant_type': 'authorization_code',
                'redirect_uri':'http://ec2-54-86-25-186.compute-1.amazonaws.com/twitchAuth',
                'code':code,
    }
    
    r = requests.post(page, values, verify=False)
    print(r.text)
    data = json.loads(r.text)
    auth_token = data["access_token"]
    #print("RESULT:\n")
    # print(r.status_code)
    
    #page = "https://api.twitch.tv/kraken/?oauth_token="+auth_token+"&scope=channel_read"
    
    
    #print(page)
    #r = requests.get(page)
    #     print(r.text)
    #     data = json.loads(r.text)
    #     user = data["token"]
    #     username = user["user_name"]
    
    headers = {'Accept':'application/vnd.twitchtv.v2+json', 'Authorization':'OAuth '+auth_token}
    page = "https://api.twitch.tv/kraken/user"
    
    r = requests.get(page, headers=headers)
    data = json.loads(r.text)
    email = data['email']
    return email




















