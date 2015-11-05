# Overview
This repository is a private repository for the planned NYU Shanghai lobby screen's files.

# Files

`.py` files are Python 2.7 files.

`application.wsgi` is a WSGI-compliant script for running the dynamic side of the webapp. WSGI was chosen as a modern, sane replacement for PHP, which is commonly used for this role. WSGI is faster, more strongly typed, and fails less silently than PHP does, and is therefore better for any non-trivial dynamic content serving. Also, all Computer Science majors at NYUSH will have learned Python as part of their major requirements.

The files in `raw/` are *tab-separated value* files. The original data used to generate the `.tsv` files (via the sophisticated method of copy-and-paste) are in [this Google spreadsheet](https://docs.google.com/a/nyu.edu/spreadsheets/d/1kwMMI-5tszjLYIF4lLMk-zWC2l4_t_JEz28GB-kxGjc/edit?usp=sharing). Running `weatherlookuptablegenerator.py` should generate a `weather.json` file, used instead of a large if/else tree to configure how the weather box looks.

`.sensitive` files are for API keys and should never be downloadable or uploaded to any repository. ``apikey.sensitive`` should contain *only* the actual API key for OrgSync (eg, `AAAAABBBBBCCCCCDDDDDEE`) and is for the Python script. Similarly, ``weatherapikey.sensitive`` is a valid API key for `openweathermap.org`.

### ***DO NOT COMMIT ANY API KEY TO THE REPOSITORY.* API keys must be kept *private* at all times.**



# Requirements
## Server
When setting up the application, ``application.wsgi`` should be configured as a WSGI application on an Apache server. Required Python libraries include

<<<<<<< HEAD
- `bs4` : Beautiful Soup 4. Used for web scraping for the AQI number.
=======
>>>>>>> bb39008b7695d9eb1817add6da3d02b85bb7e126
- `cherrypy`: the WSGI-framework
- `dateutil`: for OrgSync API date parsing
- `google-api-python-client`: For authentication
- `gspread`: for interacting with Google Spreadsheets
- `markdown`: for parsing markdown for announcements
- `requests`: for Pythonic web requests

Additionally, a version of Apache 2 (testing was done on Apache/2.4.7 Ubuntu) is required to host the WSGI application. While the testing of the various Python scripts were done on version `2.7.6`, any `2.7.*` version should work. 

The format of the WSGI application and public access files should look like this:
```
root/
+ apikey.sensitive # NOT public
+ weatherapikey.sensitive  # NOT public
+ application.wsgi
+ eventsorter.py
+ weather.json
+ tv.js
+ ----- cherrypy/ # the WSGI application mount point
+ ----- htdocs/ # these files are all public
        + tv.html
        + tv.css
        + ----- images/
                + (all the images)
```

The reason `tv.js` is not directly served from `htdocs/` is because the contents of `weather.json` are injected into `tv.js` before being served. `cherrypy/tvjs` returns the templated `tv.js` to any client.

## Client
`tv.html` by default requests all required libraries from Cloudflare's Javascript CDN. However, in the event that Cloudflare cannot be accessed, the required Javascript libraries are:
- `d3.js`
- `jQuery`