import logging
import datetime
import json
import sys
import os
import codecs
from dateutil import parser

logger = logging.getLogger('wsgi')
logger.setLevel(logging.DEBUG)
ch = logging.FileHandler("nginx.log")
logger.addHandler(ch)

def prettifyDate(datestring):
    # Turn the API-style date into an array of date things.
    date = parser.parse(datestring)
    return [date.year, date.month, date.day, date.weekday()+1]

def prettify(content):
    # Change the dictionary keys to something shorter & JS friendly
    translation = {
        "Timestamp": "timestamp",
        "Announcement start date": "startdate",
        "Announcement end date": "enddate",
        "Announcement title": "title",
        "Announcement content": "content" 
    }
    out = []
    for record in content:
        newrecord = {}
        for key in record:
            newrecord[translation[key]] = record[key]          
        out.append(newrecord)
    return out

import copy
def sort(content):
    # content is a list of dictionaries.
    # first, make the date an array for easier access.
    content = copy.deepcopy(content)
    timefields = ["Announcement start date",
        "Timestamp",
        "Announcement end date"
    ]
    for record in content:
        for key in record:
            if key in timefields:
                record[key] = prettifyDate(record[key])
    return prettify(content)
