import logging
import datetime
import json
import sys
import os

orgIDs = {
    "Campus Life": 86405,
    "Student Organizations": 83439
}

logger = logging.getLogger('wsgi')
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler(sys.stderr)
logger.addHandler(ch)

DUMPTOFILE = False

def findSoonestOccurrence(timestr, occs):
    occs = sorted(occs, key=lambda x: x["starts_at"])
    for o in occs:
        if o["ends_at"] < timestr: # if the event already ended
            continue
        return o
    # If all occurrences have passed, return None
    return None

def sort(orgID, TESTING=False, DUMPTOFILE=False):
    apikeydir = os.path.abspath(os.path.join(os.path.dirname(__file__), "apikey.sensitive"))
    with open(apikeydir) as f:
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
        if True:# event["is_public"]:
            occ = findSoonestOccurrence(timestring, event["occurrences"])
            if occ:
                eventsfound.append({
                    "name"      :event["name"],
                    "location"  :event["location"],
                    "start_time":occ["starts_at"],
                    "end_time"  :occ["ends_at"]
                    })
    
    # Sort the found events to find the soonest 4.
    out = sorted(eventsfound, key=lambda x: x["start_time"])
    try:
        return out[:4]
    except:
        return out # less than 4 valid events

def sortAll(TESTING=False, DUMPTOFILE=False):
    AllEvents = [sort(x, TESTING, DUMPTOFILE) for x in orgIDs.values()]
    combined = []
    for e in AllEvents:
        combined.extend(e)
    out = sorted(combined, key=lambda x: x["start_time"])
    try:
        return out[:4]
    except:
        return out # less than 4 valid events.
    

if __name__=="__main__":
    from pprint import pprint
    pprint(sortAll(DUMPTOFILE=True)) # 'refresh' the testcase when run standalone