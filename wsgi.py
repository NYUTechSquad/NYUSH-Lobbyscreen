import os
import sys

sys.path.append(os.path.dirname(__file__))

os.environ['PYTHON_EGG_CACHE'] = '/home/user1/NYUSH-Lobbyscreen/.eggcache'

import logging
import eventsorter
import announcementsorter
import requests
sys.stdout = sys.stderr

# Can only print using this logger, because Apache
logger = logging.getLogger('wsgi')
logger.setLevel(logging.DEBUG)
# ch = logging.FileHandler("nginx.log")
ch = logging.StreamHandler(stream=sys.stderr)
logger.addHandler(ch)

import atexit
import threading
import cherrypy
import json
import codecs
import bs4
from oauth2client.client import SignedJwtAssertionCredentials
import gspread
import markdown
import pprint

cherrypy.config.update({'environment': 'embedded', "log.screen":True})

if cherrypy.__version__.startswith('3.0') and cherrypy.engine.state == 0:
    cherrypy.engine.start(blocking=False)
    atexit.register(cherrypy.engine.stop)

def slurp(filename):
    with codecs.open(os.path.abspath(os.path.join(os.path.dirname(__file__), filename))) as f:
        return f.read()

html_escape_table = {
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
    ">": "&gt;",
    "<": "&lt;",
    }

def html_escape(text):
    """Produce entities within text."""
    return "".join(html_escape_table.get(c,c) for c in text)



class Root(object):
    def __init__(self):
        self.counter = 0
        self.weatherapikey = slurp("weatherapikey.sensitive")


    def index(self):
        self.counter += 3
        return 'Hello World!%d' % (self.counter)
    index.exposed = True

    def events(self):
        cherrypy.response.headers['Content-Type']= 'application/json'
        TESTING = False
        if TESTING:
            r = eventsorter.sort(86405, TESTING=True, DUMPTOFILE=False, LEGACY=False)
        else:
            r = eventsorter.sortAll()
        # Let's have a test case.
        return json.dumps(r)
    events.exposed = True

    def legacyevents(self):
        return json.dumps(eventsorter.sort(86405, TESTING=True, LEGACY=True))
    legacyevents.exposed = True

    def weather(self):
        return requests.get(r"http://api.openweathermap.org/data/2.5/weather?q=shanghai&lang=zh_cn&APPID=" +
                            self.weatherapikey).text
    weather.exposed = True

    def aqi(self):
        page = requests.get(r"http://www.semc.gov.cn/home/index.aspx").text
        soup = bs4.BeautifulSoup(page, 'lxml')
        return soup.select("span.big")[0].get_text().strip()
    aqi.exposed = True

    @cherrypy.tools.json_out()
    def announcements(self):
        json_key = json.loads(slurp('TVScreenTest-d74f3f051385.json'))
        scope = ['https://spreadsheets.google.com/feeds']
        credentials = SignedJwtAssertionCredentials(json_key["client_email"], json_key["private_key"], scope)
        gc = gspread.authorize(credentials)
        sheet = gc.open_by_key('1SDu06-T5D1VaiuzFQ_aQqHoffL0qllTGGY5Qk52xo9g')
        worksheet = sheet.get_worksheet(0)
        content = worksheet.get_all_records(head=1)
        for record in content:
            record["Announcement content"] = markdown.markdown(record["Announcement content"])
            del record["Username"]
        return announcementsorter.sort(content)
    announcements.exposed = True



application = cherrypy.Application(Root(), script_name="/cherrypy/", config=None)
