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

cherrypy.config.update({'environment': 'embedded'})

if cherrypy.__version__.startswith('3.0') and cherrypy.engine.state == 0:
    cherrypy.engine.start(blocking=False)
    atexit.register(cherrypy.engine.stop)

class Root(object):
    def __init__(self):
        self.counter = 0        

    def index(self):
        self.counter += 3
        return 'Hello World!%d' % (self.counter)
    index.exposed = True

    def text(self):
        try:
            cherrypy.response.headers['Content-Type']= 'application/json'
            r = sorter.sort(86405)
            return json.dumps(r)
        except BaseException as e:
            logger.error("<<<<<<PYTHON STDOUT>>>>>> " + str(e))
    text.exposed = True

application = cherrypy.Application(Root(), script_name=None, config=None)