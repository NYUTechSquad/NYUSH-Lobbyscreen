import json
import codecs
import os

# all these functions work on a line-to-line basis
# Return a tuple of (key, object)
def weathernames(line):
    key = line[0]
    obj = {
        "filename": line[2],
        "hasNightfile": True if line[3]=="TRUE" else False,
        "nightfileName": line[4],
        "en": line[5],
        "cn": line[6]
    }
    return key, obj

def padding(line):
    key = line[0]
    obj = line[1]
    return key, obj

def aqi(line):
    key = line[0]
    obj = {
        "en": line[1],
        "cn": line[2],
        "color": line[3],
        "textcolor": line[4]
    }
    return key, obj

functionTable = {
    "padding.tsv": padding,
    "weathernames.tsv": weathernames,
    "aqi.tsv": aqi
}

files = os.listdir("raw")

data = {}

for filename in files:
    basename = filename.split(".")[0]
    content = {}
    function = functionTable[filename]
    with codecs.open("raw/" + filename, 'r', 'utf-8') as f:
        for line in f:
            k,v = function(line.strip("\n").split("\t"))
            content[k] = v
    data[basename] = content

with codecs.open("weather.json", "w", 'utf-8') as f:
    json.dump(data, f)