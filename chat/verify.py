import urllib
import urllib2
import requests
import json


def ver_ign(ign):
    result =[]
    
    page = 'https://prod.api.pvp.net/api/lol/na/v1.4/summoner/by-name/'+ign+'?api_key=94c47c80-06cd-47a6-88d8-8a5331ef53b1' 
    
    # page = 'https://54.225.76.249/api/2.0/custom_reports/?nwlat=30.304855&nwlong=-97.771883&selat=30.292196&selong=-97.759105&max_results=2'
    #page = 'https://54.225.76.249/api/2.0/testers/'
    
    idizzle=0
    # r = requests.get(page, auth=('crazyskateface2@gmail.com','massive1'),verify=False)
    r = requests.get(page,verify=False)
    
    #print(r.text)
    data = json.loads(r.text)
    #print("RESULT:\n")
    #print(r.status_code)
    stuff = data[ign]
    idizzle = stuff['id']
    
    #print(idizzle)
    page = 'https://prod.api.pvp.net/api/lol/na/v1.4/summoner/'+str(idizzle)+'/masteries?api_key=94c47c80-06cd-47a6-88d8-8a5331ef53b1'
    r = requests.get(page,verify=False)
    
    #print(r.text)
    data = json.loads(r.text)
    #print("RESULT:\n")
    #print(r.status_code)
    
    verified = False
    data = data[str(idizzle)]
    pages = data['pages']
    for i in pages:
        if i['name'] == 'AP':
            #print i['name']
            verified = True
            print('\n Verified!')
    result.append(verified)   
    
    page = 'https://prod.api.pvp.net/api/lol/na/v2.4/league/by-summoner/'+str(idizzle)+'?api_key=94c47c80-06cd-47a6-88d8-8a5331ef53b1'
    r = requests.get(page,verify=False)
    data = json.loads(r.text)
    
    page = 'https://prod.api.pvp.net/api/lol/na/v2.4/league/by-summoner/'+str(idizzle)+'/entry?api_key=94c47c80-06cd-47a6-88d8-8a5331ef53b1'
    r = requests.get(page,verify=False)
    data = json.loads(r.text)
    data = data[str(idizzle)]
    data = data[0]
    
    tier = data['tier']
    division = data['entries']
    division = division[0]['division']
    
    
    return {'verified':verified,'tier':tier,'division': division}
            
            
            
            