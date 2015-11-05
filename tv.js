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

JSONFILE = %s // to be replaced server-side using Python
;WEATHERDATA = JSONFILE["weathernames"];
PADDINGDATA = JSONFILE["padding"];
AQIFORMATTING = JSONFILE["aqi"];

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

function onWindowResize() {
    var width = document.body.clientWidth;
    if (width < 200) {
        d3.select("#weatherbar").style("display", "none");
        d3.select("")
    } else {
        d3.select("#weatherbar").style("display", null);
    }    
}

$(window).load(function() {
    // Link the onresize function to the event
    onWindowResize();
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
		d3.json("cherrypy/weather", function(e,data){processData(data);});

        function processData(data) ///the function that will run when the request is succeeded
        {
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
        	/*// This is a manual parse of XML data.
        	// Is not pretty, but works and is legacy.
                var count = null;
                var count2 = null;
                for (count = 500; count < 1200; count +=
                    1) {
                    if (data[count - 3] == "A" &&
                        data[count - 2] == "Q" &&
                        data[count - 1] == "I") {
                        count2 = count;
                        for (count2; count2 < count +
                            10; count2 += 1) {
                            if (data[count2] ==
                                "<") {
                                break;
                            }
                        }
                        break;
                    }
                }
                var AQI = (data.slice(count + 1,
                    count2));*/
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
                        .attr("height", "100vh")
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
        ///////////////////////////Get json data from server
        function processEventData(data) {
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

        d3.json("cherrypy/events", function(e,data) {processEventData(data);});
       
        $("#contentpane").css("display", "inline");

    } //end refresh()

    refresh();
    setInterval(refresh, 1000 * 60 * 10); // refresh every 10mins



}); // end $(window).load