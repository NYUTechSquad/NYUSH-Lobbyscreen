import os
import sys

sys.path.append(os.path.dirname(__file__))

os.environ['PYTHON_EGG_CACHE'] = '/srv/www/localhost/.python-egg'

import logging
import sorter
import requests
sys.stdout = sys.stderr

# Can only print using this logger, because Apache
logger = logging.getLogger('wsgi')
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler(sys.stderr)
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

cherrypy.config.update({'environment': 'embedded'})

if cherrypy.__version__.startswith('3.0') and cherrypy.engine.state == 0:
    cherrypy.engine.start(blocking=False)
    atexit.register(cherrypy.engine.stop)

def slurp(filename):
    try:
        with codecs.open(os.path.abspath(os.path.join(os.path.dirname(__file__), filename))) as f:
            return f.read()
    except BaseException as e:
        logger.error(e)


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
        TESTING = True
        if TESTING:
            r = sorter.sort(86405, TESTING=True, DUMPTOFILE=False, LEGACY=False)
        else:
            r = sorter.sortAll()
        # Let's have a test case.
        return json.dumps(r)
    events.exposed = True

    def legacyevents(self):
        return json.dumps(sorter.sort(86405, TESTING=True, LEGACY=True))
    legacyevents.exposed = True

    def tvjs(self):
        cherrypy.response.headers['Content-Type'] = 'text/javascript'
        return slurp("tv.js") % (slurp("weather.json"))
    tvjs.exposed = True

    def weather(self):
        return requests.get(r"http://api.openweathermap.org/data/2.5/weather?q=shanghai&lang=zh_cn&APPID=" +
                            self.weatherapikey).text
    weather.exposed = True

    def aqi(self):
        page = requests.get(r"http://www.semc.gov.cn/home/index.aspx").text
        soup = bs4.BeautifulSoup(page, 'lxml')
        return soup.select("span.big")[0].get_text().strip()
    aqi.exposed = True

    def announcements(self, col=1):
        json_key = json.loads(slurp('TVScreenTest-d74f3f051385.json'))
        scope = ['https://spreadsheets.google.com/feeds']
        credentials = SignedJwtAssertionCredentials(json_key["client_email"], json_key["private_key"], scope)
        gc = gspread.authorize(credentials)
        sheet = gc.open_by_key('1SDu06-T5D1VaiuzFQ_aQqHoffL0qllTGGY5Qk52xo9g')
        worksheet = sheet.get_worksheet(0)
        return str(worksheet.col_values(int(col)))
    announcements.exposed = True

    def announcements_html(self, row=2):
        json_key = json.loads(slurp('TVScreenTest-d74f3f051385.json'))
        scope = ['https://spreadsheets.google.com/feeds']
        credentials = SignedJwtAssertionCredentials(json_key["client_email"], json_key["private_key"], scope)
        gc = gspread.authorize(credentials)
        sheet = gc.open_by_key('1SDu06-T5D1VaiuzFQ_aQqHoffL0qllTGGY5Qk52xo9g')
        worksheet = sheet.get_worksheet(0)
        text = worksheet.col_values(6)[int(row)-1]
        return markdown.markdown(text)
    announcements_html.exposed = True



application = cherrypy.Application(Root(), script_name=None, config=None)