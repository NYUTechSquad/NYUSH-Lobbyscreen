define(['d3', 'jquery', 'weatherdata'], function(d3, $, JSONFILE){

var engMonthsKey = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
var engWeekKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday'
];
var zhWeekKey = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

function updateClock() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var AP = "AM";
    var dd = today.getDate();
    var mm = today.getMonth();
    var ww = today.getDay();
    if (m < 10) {
        m = "0" + m;
    }
    if (h >= 12) {
        h = h - 12;
        AP = "PM";
        if (h == 0) {
            h = 12;
        }
    }

    var dateheader = d3.select("#dateheader").html('');
    dateheader.append("div").attr("class","nomarginstuff date")
                    		.text(engWeekKey[ww] + ', ' + engMonthsKey[mm] + " " + dd);
    dateheader.append("div").attr("class","nomarginstuff date")
                    		.text((mm + 1) + '月' + dd + '日' + ",  " + zhWeekKey[ww]);
    $("#clock").html('' + h + ":" + m + " " + AP + '');
}

;WEATHERDATA = JSONFILE["weathernames"];
PADDINGDATA = JSONFILE["padding"];
AQIFORMATTING = JSONFILE["aqi"];

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
};

// Find font size so that width is equal to or smaller than target.
// Is a trial-and-error function.
function findTextWidth(text, font, initial, target) {
    var size = initial;
    var textsize = target * 10;
    while (textsize > target) {
        size -= 1;
        textsize = getTextWidth(text, size + "px " + font);
    }
    return size
}

// Code for format borrowed from stackoverflow's formatUnicorn.
// Useage: "Hello, {name}, I'm {adj} that you can't {verb}.".format({"name":"Dave", 
//                  "adj":"glad", "verb":"talk"})
String.prototype.format = function() {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (("string" == args || "number" == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    }

function getInnerWidth(id) {
    var cs = window.getComputedStyle(document.getElementById("aqi_box"), null);
    var px = cs.getPropertyValue("width");
    return +px.slice(0, px.length - 2);
} 

function onWindowResize() {
    var width = document.body.clientWidth;
    if (width < 200) {
        d3.select("#weatherbar").style("display", "none");
        d3.select("")
    } else {
        d3.select("#weatherbar").style("display", null);
    }   
    if (d3.select("#aqi_box")[0][0] != null) {
        // Try to make the text fit into the AQI box.
        var fonts =["gotham",
                    "Noto Sans CJK SC", 
                    "gotham",
                    "gotham",
                    "Noto Sans CJK SC"
        ];
        var target_width = getInnerWidth("aqi_box");
        d3.select("#aqi_box").selectAll("p").each(function(d,i){
            if (i == 0 || i == 1) {
                var w = findTextWidth(d[1], fonts[i], 16, target_width);
                d3.select(this).style("font-size", w);
            }
        });
    }    
}

document.addEventListener("DOMContentLoaded", onload);


function setweather(data) {
    timeNow = new Date();
    msecNow = timeNow.getTime();
    sunrise = data.sys.sunrise + '000';
    sunset = data.sys.sunset + '000';
    var daytime = false;
    if (sunrise <= msecNow && msecNow <= sunset) {
        daytime = true;
    }

    weather_main = data.weather[0].main; //variable "data" refers to the JSON data we got
    eng_weather = '';
    zh_weather = data.weather[0].description;
    weather_id = data.weather[0].id;
    wind = Math.round(data.wind.speed);
    temperature = Math.round(data.main.temp - 273.15);
    eng_weather = '';
    weatherImgSrc = '';
    extraRightPadding = 0;

    // Using the data saved from earlier, set properties
    var info = WEATHERDATA[weather_id]
    if (info.hasNightFile) {
        weatherImgSrc = info.nightfilename
    }
    else {
        weatherImgSrc = info.filename
    }
    eng_weather = info.en
    zh_weather = info.cn
    extraRightPadding = PADDINGDATA[weatherImgSrc]

    // give it the proper path
    weatherImgSrc = "images/" + weatherImgSrc;

    eng_weather = eng_weather;

    d3.text("cherrypy/aqi", function(e, data){
        aqi(data);
    });
    
    function aqi(data) {
    // because the xml source is down for now, the data will be scraped
    // from http://www.semc.gov.cn/home/index.aspx via the server.
        var AQI = +data;

        var AQItype = '';
        if (AQI < 0) {
            AQItype = 'none';
            AQI = 'N/A';
        } else if (AQI <= 50) {
            AQItype = 'good';
        } else if (AQI <= 100) {
            AQItype = 'moderate';
        } else if (AQI <= 150) {
            AQItype = 'littleunhealthy';
        } else if (AQI <= 200) {
            AQItype = 'unhealthy';
        } else if (AQI <= 300) {
            AQItype = 'veryunhealthy';
        } else {
            AQItype = 'hazardous';
        }
        
        var F = AQIFORMATTING[AQItype]; // get formatting data from json
        var eng_aqi_desc = F["en"];
        var zh_aqi_desc = F["cn"];
        var color = F["color"];
        var text = F["textcolor"];

        $("#weather_eng_desc").html(eng_weather);
        $("#weather_zh_desc").html(zh_weather);

        d3.select("#weatherimageholder") // clears existing content
            .html('')
            .append("img")
                .attr("class", "nomarginstuff")
                .attr("id", "weatherimage")
                .attr("width", "70%")
                .style("padding-right", extraRightPadding)
                .attr("src", weatherImgSrc);
        $("#temperature").html(temperature + '˚')

        var aqidata = [
                ["eng_air_quality_title", "Air Quality Index"],
                ["zh_air_quality_title", "空 气 质 量 指 数"],
                ["aqi_number", AQI],
                ["eng_aqi_desc", eng_aqi_desc],
                ["zh_aqi_desc", zh_aqi_desc]
            ];
        // semi-automatically filling in all the data for AQI display
        aqibox = d3.select("#aqi_boxholder").html('')
                    .append("div")
                    .attr("id", "aqi_box")
                    .style("background", color)
                    .style("color", text);
        aqibox.selectAll("p").data(aqidata).enter()
            .append("p")
                .attr("id", function(d){return d[0];})
                .text(function(d){return d[1]});
    }
}

function setevents(data) {
    var datestrings = [];

    for (var i in data) {
            var startdate = data[i]["start_time"];
            var enddate   = data[i]["end_time"];
            var datestr = "{wkday}, {enmonth} {date} | {month}月{date}日 {cnwkday}";
            datestr = datestr.format({
                wkday  : engWeekKey[startdate[5]],
                enmonth: engMonthsKey[startdate[1]-1],
                date   : startdate[2],
                month  : startdate[1],
                cnwkday: zhWeekKey[startdate[5]]
            });
            // If it is an all day event, timestring only says "All Day"
            var timestr = "";
            if (data[i]["is_all_day"]) {
                timestr = "All day";
            } else {
                // Zero-pad minutes, turn 24 hour times into 12 hour times.
                timestr = "{h_start}:{mm_start} {AP_start} - {h_end}:{mm_end} {AP_end}";
                var mm_start = startdate[4];
                if (mm_start < 10) {
                    mm_start = "0" + mm_start;
                }
                var mm_end = enddate[4];
                if (mm_end < 10) {
                    mm_end = "0" + mm_end;
                }
                var h_start = startdate[3];
                var AP_start = "AM";
                if (h_start > 12) {
                    h_start -= 12;
                    AP_start = "PM";
                }
                var h_end = enddate[3];
                var AP_end = "AM";
                if (h_end > 12) {
                    h_end -= 12;
                    AP_end = "PM";
                }
                timestr = timestr.format({
                    h_start : h_start,
                    mm_start: mm_start,
                    h_end   : h_end,
                    mm_end  : mm_end,
                    AP_start: AP_start,
                    AP_end  : AP_end
                });
            }                   

            datestrings.push([datestr, timestr]);
        }
    

    var leftstuff = d3.select("#eventscontainer").html('');
    for (i in data) {
        if (data[i].location == 'No location has been entered for this event.') {
            data[i].location = 'Location To Be Determined';
        }

        var eventfield = leftstuff.append("div").classed("event", true)
                                  .attr("id","event" + (+i+1));
        eventfield.append("div").attr("class","name")
                  .append("a").text(data[i].name)
                  .attr("href", "https://orgsync.com/" + data[i].orgid 
                    + "/events/" + data[i].id)
                  .attr("class", "secretlink");
        eventfield.append("div").attr('class',"eventdesc eventdate")
                  .text(datestrings[i][0]);
        eventfield.append("div").attr('class',"eventdesc eventtime")
                  .text(datestrings[i][1]);
        eventfield.append("div").attr('class',"eventdesc eventlocation")
                  .text(data[i].location);
    }
}

function setannouncements(data) {
    var datestrings = [];

    for (var i in data) {
            var startdate = data[i].startdate;
            var enddate   = data[i].enddate;
            var datestr = "{wkday}, {enmonth} {date} | {month}月{date}日 {cnwkday}";
            datestr = datestr.format({
                wkday  : engWeekKey[startdate[5]],
                enmonth: engMonthsKey[startdate[1]-1],
                date   : startdate[2],
                month  : startdate[1],
                cnwkday: zhWeekKey[startdate[5]]
            }); 
            datestrings.push(datestr);
        }
    

    var leftstuff = d3.select("#announcementcontainer").html('');
    for (i in data) {
        if (data[i].location == 'No location has been entered for this event.') {
            data[i].location = 'Location To Be Determined';
        }

        var eventfield = leftstuff.append("div").attr("class", "announcement event")
                                  .attr("id","announcement" + i);
        eventfield.append("div").attr("class","name")
                  .append("a").text(data[i].title);
        eventfield.append("div").attr('class',"eventdesc eventdate")
                  .text(datestrings[i]);
        eventfield.append("div").attr('class',"eventdesc location")
                  .html(data[i].content);        
    }
}

function scrollTween(target) {
    return function() {
        var i = d3.interpolateNumber(this.scrollTop, target);
        return function(t) {this.scrollTop = i(t);};
    };
}

var start = 0;
var end = 0;
function scrollTo(index, duration) {
    if (!duration) duration = 1000;
    var container = d3.select("#announcementcontainer");
    var previous = container.property("scrollTop");
    container
      .call(function(){end = new Date().getTime() + duration;})
      .transition()
      .duration(duration)
      .tween('scrolltween', scrollTween(+previous + $('#announcement'+index).position().top));
}

// when is milliseconds-from-now
function timeoutclosure(i, when) {
    window.setTimeout(function(){
            scrollTo(i);
        }, when);
}

// actually do the scrolling for the div
function doScroll(duration) {
    start = new Date().getTime();
    if(!duration) duration=8000;
    var num = d3.selectAll(".announcement")[0].length;
    var onetime = duration / (num+1);
    for (var i = 1; i < num; i++) {
        timeoutclosure(i, i*onetime);
    }
    window.setTimeout(function(){
            scrollTo(0, 2000);
        }, num*onetime);
}

function fadeout(selector, duration) {
    d3.select(selector)
      .style("opacity", "1")
      .transition()
      .duration(duration)
      .style("opacity","0");
    window.setTimeout(function(){
            d3.select(selector).style("display", "none");
        }, duration);
}

function fadein(selector, duration) {
    d3.select(selector)
      .style("opacity", "0")
      .style("display", "")
      .transition()
      .duration(duration)
      .style("opacity","1");
}

function fadeoutin(outsel, insel, duration) {
    fadeout(outsel, duration);
    window.setTimeout(function(){
        fadein(insel, duration);}, duration);
}


function arcTween(arc, angle) {
    return function() {
        var i = d3.interpolateNumber(0, angle);
        var sel = d3.select(this);
        return function(t) {
            sel.attr("d", arc({endAngle:i(t)}));
        };
    };
}

function animateslides(eventduration, announceduration) {
    var time = 1000;
    drawtimer(eventduration);
    window.setTimeout(function(){
        // do a transition to the announcement slide.
        fadeoutin("#eventscontainer", "#announcementcontainer", time);
        drawtimer(announceduration);
        doScroll(announceduration);
    }, eventduration);
    window.setTimeout(function(){
        // do a transition back to the event slide
        fadeoutin("#announcementcontainer", "#eventscontainer", time);
    }, announceduration+eventduration);
}

function drawtimer(duration) {
    var svg = d3.select("#timersvg").html('')
                .append("g")
                .attr("transform","translate(20, 20)");
    svg.append("circle")
       .attr("id", "totaltime")
       .attr("r", 20)
       .attr("x", 0)
       .attr("y", 0);
    var arc = d3.svg.arc().innerRadius(0)
                          .outerRadius(20)
                          .startAngle(0);
    var graph = svg.append("path").attr("id", "elapsedtime");
    graph.transition().duration(duration).ease("linear").tween('arctween', arcTween(arc, 2*Math.PI));
}

function onload() {
    // Link the onresize function to the event
    d3.select(window).on("resize", onWindowResize);
    // Initalize clock
    updateClock();
    window.setInterval(updateClock, 1000);
    ///////////////////////////// 
    var weather_main = ""; //variable "data" refers to the JSON data we got
    var weather_description = "";
    var wind = 0;
    var temperature = 1;

    function refresh() {
		d3.json("cherrypy/weather", function(e,data){setweather(data);});
        d3.json("cherrypy/events", function(e,data) {setevents(data);});
        d3.json("cherrypy/announcements", function(e,data) {setannouncements(data);});
        $("#contentpane").css("display", "inline");
        onWindowResize();
    } //end refresh()

    refresh();
    onWindowResize();
    setInterval(refresh, 1000 * 60 * 10); // refresh every 10mins
    var eventdur = 30000;
    var announcedur = 60000;
    animateslides(eventdur, announcedur);
    setInterval(function(){animateslides(eventdur, announcedur);}, eventdur+announcedur); // each slide lasts for a minute and 4.
}

return onload;
}); // end of the define() callback