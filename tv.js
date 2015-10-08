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

    var engMonthsKey = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    var engWeekKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday'
    ];
    var zhWeekKey = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    $("#dateHeader").html(
            ' <div class="nomarginstuff date">' + engWeekKey[ww] + ', ' +
            engMonthsKey[mm] + " " + dd + '</div>'
            + '<div class="nomarginstuff date">' + (mm + 1) + '月' + dd + '日' +
            ",&nbsp&nbsp" + zhWeekKey[ww] + '</div> '
        );
    $("#sh_clock").html(
    		'' + h + ":" + m + " " + AP + ''
    	);
}

JSONFILE = %s // to be replaced server-side using Python
WEATHERDATA = JSONFILE["weathernames"]
PADDINGDATA = JSONFILE["padding"]

///////////////////////////// ///////////////////////////// ///////////////////////////// 

$(window).load(function() {
	updateClock();
	window.setInterval(updateClock, 1000);
    ///////////////////////////// 
    var weather_main = ""; //variable "data" refer to the JSON data we got
    var weather_description = "";
    var wind = 0;
    var temperature = 1;

    function refresh() {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/weather?q=shanghai&lang=zh_cn",
            dataType: "json",
            success: processData,
            error: function() {
                    console.log("Weather data request failed.");
                } //put function statements into these {}. They run when the request is failed.
        });

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

            weather_main = data.weather[0].main; //variable "data" refer to the JSON data we got
            eng_weather = '';
            zh_weather = data.weather[0].description;
            weather_id = data.weather[0].id;
            wind = Math.round(data.wind.speed);
            temperature = Math.round(data.main.temp - 273.15);
            eng_weather = '';
            weatherImgSrc = '';
            extraRightPadding = 0;

            // Using the data saved from earlier, set properties
            info = WEATHERDATA[weather_id]
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
        	weatherImgSrc = "images/" + weatherImgSrc

            eng_weather = eng_weather.split(' ').join('</br>'); // so each word goes on its own line of text

            //Get AQI and display:
            $.ajax({
                url: 'http://whateverorigin.org/get?url=' +
                    encodeURIComponent(
                        'http://www.stateair.net/web/rss/1/4.xml'
                    ) + '&callback=?',
                dataType: 'json',
                success: function(data) {
                    var contentJson = data.contents;
                    var count = null;
                    var count2 = null;
                    for (count = 500; count < 1200; count +=
                        1) {
                        if (contentJson[count - 3] == "A" &&
                            contentJson[count - 2] == "Q" &&
                            contentJson[count - 1] == "I") {
                            count2 = count;
                            for (count2; count2 < count +
                                10; count2 += 1) {
                                if (contentJson[count2] ==
                                    "<") {
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    var AQI = (contentJson.slice(count + 1,
                        count2));

                    eng_aqi_desc = ''; // add in data from feed
                    zh_aqi_desc = '';
                    color = '';
                    text = '';

                    if (AQI <= 50) {
                        eng_aqi_desc = 'Good';
                        zh_aqi_desc = '健康';
                        color =
                            'background: linear-gradient(180deg, #00A300, #007E00);';
                        text = '#C6C1B7';
                    } else if (50 < AQI && AQI <= 100) {
                        eng_aqi_desc = 'Moderate';
                        zh_aqi_desc = '中等';
                        color =
                            'background: linear-gradient(180deg, #FFAF00, #C7A000);';
                    } else if (100 < AQI && AQI <= 150) {
                        eng_aqi_desc =
                            'Unhealthy for Sensitive Groups';
                        zh_aqi_desc = '对敏感人群不健康';
                        color =
                            'background: linear-gradient(180deg, #FFA200, #CF7200);';
                    } else if (150 < AQI && AQI <= 200) {
                        eng_aqi_desc = 'Unhealthy';
                        zh_aqi_desc = '不健康 ';
                        color =
                            'background: linear-gradient(180deg, #A91B00, #890B00);';
                        text = '#C6C1B7';
                    } else if (200 < AQI && AQI <= 300) {
                        eng_aqi_desc = 'Very Unhealthy';
                        zh_aqi_desc = '非常不健康';
                        color =
                            'background: linear-gradient(180deg, #4D0036, #430029);';
                        text = '#C6C1B7';
                    } else if (300 < AQI) {
                        eng_aqi_desc = 'Hazardous';
                        zh_aqi_desc = '危险';
                        color =
                            'background: linear-gradient(180deg, #542100, #330600);';
                        text = '#C6C1B7';
                    }

                	$("#eng_desc").html(eng_weather);
                	$("#zh_desc").html(zh_weather);
                	$("#weatherimageHolder").html(
                		'<img class="nomarginstuff" id="weatherimage" style="padding-right: ' +
                        extraRightPadding + '" src=' +
                        weatherImgSrc + '>');
                	$("#temp_number").html(temperature + '˚')

                    if (AQI > -1) { // this will prevent it from showing any negative numbers (negative numbers are false data)
                        $("#aqi_boxHolder").html(
                        		'<div class="nomarginstuff" id="aqi_box" style="' +
	                            color + '; color: ' + text +
	                            '">' +
	                            '<p class="nomarginstuff right" id="eng_air_quality_title">' +
	                            'Air Quality Index' + '</p>' +
	                            '<p class="nomarginstuff right" id="zh_air_quality_title">' +
	                            '空&nbsp气&nbsp质&nbsp量&nbsp指&nbsp数' +
	                            '</p>' +
	                            '<p class="nomarginstuff right" id="aqi_number">' +
	                            AQI + '</p>' +
	                            '<p class="nomarginstuff right" id="eng_aqi_desc">' +
	                            eng_aqi_desc + '</p>' +
	                            '<p class="nomarginstuff right" id="zh_aqi_desc">' +
	                            zh_aqi_desc + '</p>' + '</div>'
                        	)
                    }
                }
            });

        }
        ///////////////////////////Get json data from server
        var jsonMimeType = "application/json";
        $.ajax({
            type: "GET",
            // contentType: "application/json; charset=utf-8",
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
                var engMonthsKey = ['January', 'February',
                    'March', 'April', 'May', 'June',
                    'July', 'August', 'September',
                    'October', 'November', 'December'
                ];
                var engWeekKey = ['Sunday', 'Monday',
                    'Tuesday', 'Wednesday', 'Thursday',
                    'Friday', 'Saturday'
                ];
                var zhWeekKey = ['星期日', '星期一', '星期二', '星期三',
                    '星期四', '星期五', '星期六'
                ];

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
                // alert("failed");
            }
        });
		
		$("#contentpane").css("display", "inline");

    } //end refresh()

    refresh();
    setInterval(function() {
        refresh(); //this will run after every certain time
    }, 600000); //10mins



}); // end $(window).load