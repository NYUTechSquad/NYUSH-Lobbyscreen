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

cherrypy.config.update({'environment': 'embedded'})

if cherrypy.__version__.startswith('3.0') and cherrypy.engine.state == 0:
    cherrypy.engine.start(blocking=False)
    atexit.register(cherrypy.engine.stop)

def slurp(filename):
    with codecs.open(os.path.abspath(os.path.join(os.path.dirname(__file__), filename))) as f:
        return f.read()

class Root(object):
    def __init__(self):
        self.counter = 0
        self.weatherapikey = slurp("weatherapikey.sensitive")

    def index(self):
        self.counter += 3
        return 'Hello World!%d' % (self.counter)
    index.exposed = True

    def text(self):
        try:
            cherrypy.response.headers['Content-Type']= 'application/json'
            TESTING = True
            if TESTING:
                r = sorter.sort(86405, TESTING=True)
            else:
                r = sorter.sortAll()
            # Let's have a test case.
            return json.dumps(r)
        except BaseException as e:
            logger.error("<<<<<<PYTHON STDOUT>>>>>> " + str(e))
    text.exposed = True

    def tvjs(self):
        cherrypy.response.headers['Content-Type'] = 'text/javascript'
        return slurp("tv.js") % (slurp("weather.json"))
    tvjs.exposed = True

    def weather(self):
        return requests.get(r"http://api.openweathermap.org/data/2.5/weather?q=shanghai&lang=zh_cn&APPID=" +
                            self.weatherapikey).text
    weather.exposed = True

    def aqi(self):
        return requests.get(r"http://www.stateair.net/web/rss/1/4.xml").text 
    aqi.exposed = True


application = cherrypy.Application(Root(), script_name=None, config=None)