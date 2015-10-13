var engMonthsKey = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
var engWeekKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday'
];
var zhWeekKey = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/////////////////////////////////////////////////////////////////////////////////////////// 
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

    var dateheader = d3.select("#dateHeader").html('');
    dateheader.append("div").attr("class","nomarginstuff date")
                    		.text(engWeekKey[ww] + ', ' + engMonthsKey[mm] + " " + dd);
    dateheader.append("div").attr("class","nomarginstuff date")
                    		.text((mm + 1) + '月' + dd + '日' + ",  " + zhWeekKey[ww]);
    $("#sh_clock").html('' + h + ":" + m + " " + AP + '');
}

JSONFILE = %s // to be replaced server-side using Python
;WEATHERDATA = JSONFILE["weathernames"];
PADDINGDATA = JSONFILE["padding"];
AQIFORMATTING = JSONFILE["aqi"];

///////////////////////////// ///////////////////////////// ///////////////////////////// 

$(window).load(function() {
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

            eng_weather = eng_weather.split(' ').join('</br>'); // so each word goes on its own line of text

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

                $("#eng_desc").html(eng_weather);
                $("#zh_desc").html(zh_weather);

                d3.select("#weatherimageHolder") // clears existing content
                    .html('')
                    .append("img")
                        .attr("class", "nomarginstuff")
                        .attr("id", "weatherimage")
                        .style("padding-right", extraRightPadding)
                        .attr("src", weatherImgSrc);
                $("#temp_number").html(temperature + '˚')

				var aqidata = [
						["eng_air_quality_title", "AirQuality Index"],
						["zh_air_quality_title", "空 气 质 量 指 数"],
						["aqi_number", AQI],
						["eng_aqi_desc", eng_aqi_desc],
						["zh_aqi_desc", zh_aqi_desc]
					];
				// semi-automatically filling in all the data for AQI display
                aqibox = d3.select("#aqi_boxHolder").html('')
                			.append("div")
                			.attr("id", "aqi_box")
                			.attr("class", "nomarginstuff")
                			.style("background", color)
                			.style("color", text);
                aqibox.selectAll("p").data(aqidata).enter()
                	.append("p")
                		.attr("class", "nomarginstuff right")
                		.attr("id", function(d){return d[0];})
                		.text(function(d){return d[1]});
            }

        }
        ///////////////////////////Get json data from server
        var jsonMimeType = "application/json";
        $.ajax({
            type: "GET",
            url: "cherrypy/text",
            beforeSend: function(x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType(jsonMimeType);
                }
            },
            dataType: "json",
            success: function getData(data) {
                var firstDateTimeLine = [];
                var secondDateTimeLine = [];

                for (i in data) {
                    var engString = "";
                    var zhString = "";
                    var thisStartWrongTimezone = new Date((
                        data[i].start_time || "").replace(
                        /-/g, "/").replace(/[TZ]/g,
                        " "));
                    var thisEndWrongTimezone = new Date((
                        data[i].end_time || "").replace(
                        /-/g, "/").replace(/[TZ]/g,
                        " "));
                    var thisStart = new Date((
                        thisStartWrongTimezone.getTime()
                    ) + 28800000)
                    var thisEnd = new Date((
                        thisEndWrongTimezone.getTime()
                    ) + 28800000)
                    if (data[i].start_time.length > 10) {
                        var startTime = '';
                        var endTime = '';
                        var timeString = '';
                        var startAmPm = 'AM';
                        var hours = thisStart.getHours();
                        if (hours > 11) {
                            startAmPm = 'PM';
                            if (hours > 12) {
                                hours -= 12;
                            }
                        }
                        var mins = ("0" + thisStart.getMinutes())
                            .slice(-2);
                        startTime = hours + ':' + mins +
                            ' ' + startAmPm;
                        var startDate = engMonthsKey[
                                thisStart.getMonth()] + ' ' +
                            thisStart.getDate();
                        timeString += startTime;
                        var endAmPm = 'AM';
                        var hours = thisEnd.getHours();
                        if (hours > 11) {
                            endAmPm = 'PM';
                            if (hours > 12) {
                                hours -= 12;
                            }
                        }
                        var mins = ("0" + thisEnd.getMinutes())
                            .slice(-2);
                        endTime = hours + ':' + mins + ' ' +
                            endAmPm;
                        var endDate = engMonthsKey[
                                thisStart.getMonth()] + ' ' +
                            thisStart.getDate();

                        timeString += ' - ' + endTime;
                    } else {
                        timeString = 'All Day';
                    }

                    var firstLine = '';
                    if (startDate == endDate) {

                        engString += engWeekKey[thisStart.getDay()] +
                            ', ' + engMonthsKey[thisStart.getMonth()] +
                            ' ' + thisStart.getDate();

                        zhString += (thisStart.getMonth() +
                                1) + '月' + thisStart.getDate() +
                            '日, ' + zhWeekKey[thisStart.getDay()];
                        firstLine = engString +
                            '&nbsp&nbsp|&nbsp&nbsp' +
                            zhString;
                        secondLine = timeString;

                    } else {
                        engString += engWeekKey[thisStart.getDay()] +
                            ', ' + engMonthsKey[thisStart.getMonth()] +
                            ' ' + thisStart.getDate() + ' ' +
                            startTime + ' - ' + engWeekKey[
                                thisEnd.getDay()] + ', ' +
                            engMonthsKey[thisEnd.getMonth()] +
                            ' ' + thisEnd.getDate() + ', ' +
                            endTime;
                        zhString += (thisStart.getMonth() +
                                1) + '月' + thisStart.getDate() +
                            '日, ' + zhWeekKey[thisStart.getDay()] +
                            ', ' + startTime + ' - ' + (
                                thisEnd.getMonth() + 1) +
                            '月' + thisEnd.getDate() + '日, ' +
                            zhWeekKey[thisEnd.getDay()] +
                            ', ' + endTime;
                        firstLine = engString;
                        secondLine = zhString;
                    }

                    firstDateTimeLine.push(firstLine);
                    secondDateTimeLine.push(secondLine);
                }
                var i;
                if (data[3].location) { 
                // random test to confirm that the data is there... this makes sure the screen doesn't display the word NULL
                    for (i = 0; i < 4; i++) {
                        if (data[i].location ==
                            'No location has been entered for this event.'
                        ) {
                            data[i].location =
                                'Location To Be Determined';
                        }

                        $("#event" + String(i + 1)).html(
                            '<div class="name">' + data[
                                i].name + '</div>' +
                            '<div class="desc thin" id="date_time_1">' +
                            firstDateTimeLine[i] +
                            '</div>' +
                            '<div class="desc thin" id="date_time_2">' +
                            secondDateTimeLine[i] +
                            '</div>' +
                            '<div class="desc thin" id="location">' +
                            data[i].location + '</div>'
                        );
                    }

                }


            },
            error: function() {
                console.log("Event data failed to load.");
            }
        });
        
        $("#contentpane").css("display", "inline");

    } //end refresh()

    refresh();
    setInterval(refresh, 1000 * 60 * 10); // refresh every 10mins



}); // end $(window).load