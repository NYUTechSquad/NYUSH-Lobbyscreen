import logging
import datetime
import json

orgIDs = {
    "Campus Life": 86405,
    "Student Organizations": 83439
}


TESTING = True
DUMPTOFILE = True

def findSoonestOccurrence(timestr, occs):
	occs = sorted(occs, key=lambda x: x["starts_at"])
	for o in occs:
		if o["ends_at"] < timestr: # if the event already ended
			pass
		return o
	raise ValueError("All events in occurrance have passed.")

def sort(orgID):
    with open("apikey.sensitive") as f:
        apikey = f.read()
    # date format is
    # 2015-09-17T05:05:00Z
    # YYYY-MM-DDTHH:MM:SSZ
    currdatetime = datetime.datetime.today()
    timestring = currdatetime.strftime("%Y-%m-%dT%H:%M:%SZ")

    url = ("https://api.orgsync.com/api/v2/orgs/%d/events?key=%s&start_date=%s"
          % (orgID, apikey, timestring))
    response = None

    # have a special testcase because the API is slow.
    if TESTING:
        import codecs
        with codecs.open("testcase.json", "r", "utf-8") as f:
            response = f.read()
    else:
        import requests
        response = requests.get(url).text
        if DUMPTOFILE:
        	import codecs
        	with codecs.open("testcase.json", "w", "utf-8") as f:
        		f.write(response)

    # next part is pre-processing data
    eventsfound = []
    data = json.loads(response)
    for event in data:
        if event["is_public"]:   
            occ = findSoonestOccurrence(timestring, event["occurrences"])
            eventsfound.append({
            	"name"      :event["name"],
            	"location"  :event["location"],
            	"start_time":occ["starts_at"],
            	"end_time"  :occ["ends_at"]
            	})
    
    # Sort the found events to find the soonest 4.
    out = sorted(eventsfound, key=lambda x: x["start_time"])
    for o in out[:4]:
    	print o["name"]


    

if __name__=="__main__":
    print sort(orgIDs["Campus Life"])