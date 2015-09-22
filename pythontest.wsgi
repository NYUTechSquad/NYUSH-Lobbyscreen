import sys
import os
import logging

# need to add environment to apache's path for includes
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))
# likewise add cherrypy
sys.path.append(os.path.abspath("/Library/Python/2.7/site-packages/"))


from pythontest import application