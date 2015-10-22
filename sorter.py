import logging
import datetime
import json
import sys
import os
import codecs
from dateutil import parser

orgIDs = {
    "Campus Life": 86405,
    "Student Organizations": 83439
}

logger = logging.getLogger('wsgi')
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler(sys.stderr)
logger.addHandler(ch)

def findSoonestOccurrence(timestr, occs):
    occs = sorted(occs, key=lambda x: x["starts_at"])
    for o in occs:
        if o["ends_at"] < timestr: # if the event already ended
            continue
        return o
    # If all occurrences have passed, return None
    return None

def prettifyDate(datestring):
    # Turn the API-style date into an array of date things.
    date = parser.parse(datestring)
    return [date.year, date.month, date.day, date.hour, date.minute, date.weekday()+1]

def prettifyEvents(events):
    out = []
    for e in events:
        out.append({
            "name"      : e["name"],
            "location"  : e["location"],
            "start_time": prettifyDate(e["start_time"]),
            "end_time"  : prettifyDate(e["end_time"]),
            "is_all_day": e["is_all_day"],
            "id"        : e["id"],
            "orgid"     : e["orgid"]
            })
    return out

jsonfpath = os.path.abspath(os.path.join(os.path.dirname(__file__), "testcase.json"))
def sort(orgID, TESTING=False, DUMPTOFILE=False, LEGACY=False):
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
        with codecs.open(jsonfpath, "r", "utf-8") as f:
            response = f.read()
    else:
        import requests
        response = requests.get(url).text
        if DUMPTOFILE:
            print("Dumping to file...")
            with codecs.open(jsonfpath, "w", "utf-8") as f:
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
                    "end_time"  :occ["ends_at"],
                    "is_all_day":occ["is_all_day"],
                    "id"        :event["id"],
                    "orgid"     :event["org_id"]
                    })
    
    # Sort the found events to find the soonest 4.
    out = sorted(eventsfound, key=lambda x: x["start_time"])
    if LEGACY:
        return out[:4]
    return prettifyEvents(out[:4])


def sortAll(TESTING=False, DUMPTOFILE=False, LEGACY=False):
    AllEvents = [sort(x, TESTING, DUMPTOFILE) for x in orgIDs.values()]
    combined = []
    for e in AllEvents:
        combined.extend(e)
    out = sorted(combined, key=lambda x: x["start_time"])
    if LEGACY:
        return out[:4]
    return prettifyEvents(out[:4])
    

if __name__=="__main__":
    from pprint import pprint
    import sys

    print sys.argv
    try:
        TESTING = True if sys.argv[1] == 't' else False
    except:
        TESTING = False
    try:
        DUMPTOFILE = True if sys.argv[2] == 'f' else False
    except:
        DUMPTOFILE = False

    pprint(sort(86405, TESTING, DUMPTOFILE)) # 'refresh' the testcase when run standalone