import sys
import os
import logging
import sorter


# Can only print using this logger, because Apache
"""logger = logging.getLogger('wsgi')
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler(sys.stderr)
logger.addHandler(ch)

logger.error("<<<<<<PYTHON STDOUT>>>>>>" +
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))"""


import sys
sys.stdout = sys.stderr

import atexit
import threading
import cherrypy

cherrypy.config.update({'environment': 'embedded'})

if cherrypy.__version__.startswith('3.0') and cherrypy.engine.state == 0:
    cherrypy.engine.start(blocking=False)
    atexit.register(cherrypy.engine.stop)

class Root(object):
    def __init__(self):
        self.counter = 0

    def index(self):
        self.counter += 2
        return 'Hello World!%d' % (self.counter)
    index.exposed = True

    def text(self):
        return sorter.sort()
    text.exposed = True

application = cherrypy.Application(Root(), script_name=None, config=None)