/////////////////////////////////////////////////////////////////////////////////////////// 
function startTime() {
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
    //var s=today.getSeconds();
    //s = checkTime(s);
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

    document.getElementById('dateHeader').innerHTML = '' +
        '<div class="nomarginstuff date">' + engWeekKey[ww] + ', ' +
        engMonthsKey[mm] + " " + dd + '</div>' +
        '<div class="nomarginstuff date">' + (mm + 1) + '月' + dd + '日' +
        ",&nbsp&nbsp" + zhWeekKey[ww] + '</div>' + '';
    // h = '10';
    // m = '00';
    document.getElementById('sh_clock').innerHTML = '' + h + ":" + m + " " + AP +
        '';
    var t = setTimeout(function() {
        startTime()
    }, 1000);
}

///////////////////////////// ///////////////////////////// ///////////////////////////// 

$(window).load(function() {

    ///////////////////////////// 
    var weather_main = ""; //variable "data" refer to the JSON data we got
    var weather_description = "";
    var wind = 0;
    var temperature = 1;
    ////////////////////////
    /////Here is date and time
    // var currentdate = new Date(); 
    // var datetime = currentdate.getDate() + "/"
    //                + (currentdate.getMonth()+1)  + "/" 
    //                + currentdate.getFullYear();
    // ////////////////////////
    // function time(){
    // 	var currentTime = currentdate.getHours() + ":"  
    // 	                + currentdate.getMinutes() + ":" 
    // 	                + currentdate.getSeconds();
    // 	// thispart = document.getElementById('alltherightstuff');
    // 	// thispart.innerHTML = currentTime;
    // }
    // time();
    // setInterval(function(){
    // 	time();//this will run after every certain time
    // },1000); //10mins


    function refresh() {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/weather?q=shanghai&lang=zh_cn",
            dataType: "json",
            success: processData,
            error: function() {
                    // 	    	alert("failed");
                } //put function statements into these {}. They run when the request is failed.
        });

        function processData(data) ///the function that will run when the request is succeeded
        {
            timeNow = new Date();
            msecNow = timeNow.getTime();
            sunrise = data.sys.sunrise + '000';
            sunset = data.sys.sunset + '000';
            var daytime = false;
            if (msecNow >= sunrise && msecNow <= sunset) {
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
            // weather_id = 300;
            // daytime = true;
            // codes explained at http://openweathermap.org/weather-conditions
            if (weather_id >= 200 && weather_id <= 299) {
                weatherImgSrc = "'images/lightning.png'";
                eng_weather = 'Storm';
                zh_weather = '雷雨';
            } else if (weather_id >= 300 && weather_id <= 500) {
                weatherImgSrc = "'images/rain.png'";
                eng_weather = 'Light Rain';
                zh_weather = '小雨';
            } else if (weather_id >= 501 && weather_id <= 599) {
                weatherImgSrc = "'images/rain.png'";
                eng_weather = 'Rain';
                zh_weather = '雨';
                if (weather_id == 511) {
                    eng_weather = 'Freezing Rain';
                    zh_weather = '冻雨';
                }
            } else if (weather_id >= 600 && weather_id <= 699) {
                weatherImgSrc = "'images/snow.png'";
                eng_weather = 'Snow';
                zh_weather = '雪';
                if (weather_id == 601) {
                    eng_weather = 'Light Snow';
                    zh_weather = '小雪';
                }
            } else if (weather_id >= 700 && weather_id <= 799) {
                weatherImgSrc = "'images/clouds.png'";
                eng_weather = 'Clouds';
                zh_weather = '多云';
                if (weather_id == '721') {
                    eng_weather = 'Haze';
                    zh_weather = '雾霾';
                    if (daytime) {
                        weatherImgSrc = "'images/day_haze.png'";
                    } else {
                        weatherImgSrc = "'images/night_haze.png'";
                    }
                } else if (weather_id == '741') {
                    eng_weather = 'Fog';
                    zh_weather = '雾';
                    weatherImgSrc = "'images/fog.png'";
                } else if (weather_id == '781') {
                    eng_weather = 'Tornado';
                    zh_weather = '龙卷风';
                    weatherImgSrc = "'images/tornado.png'";
                }
            } else if (weather_id >= 800 && weather_id <= 899) {
                eng_weather = 'Clouds';
                zh_weather = '多云';
                weatherImgSrc = "'images/clouds.png'";
                if (weather_id == 800) {
                    eng_weather = 'Clear';
                    zh_weather = '晴';
                    if (daytime) {
                        weatherImgSrc = "'images/sun.png'";
                    } else {
                        weatherImgSrc = "'images/night_clear.png'";
                    }
                } else if (weather_id == 801) {
                    eng_weather = 'Clear';
                    zh_weather = '晴';
                    if (daytime) {
                        weatherImgSrc = "'images/sun.png'";
                    } else {
                        weatherImgSrc = "'images/night_clear.png'";
                    }
                } else if (weather_id == 802 || weather_id == 803) {
                    if (weather_id == 802) {
                        eng_weather = 'Scattered Clouds';
                        zh_weather = '多云';
                    } else {
                        eng_weather = 'Broken Clouds';
                        zh_weather = '多云';
                    }
                    if (daytime) {
                        weatherImgSrc = "'images/part_sun.png'";
                    } else {
                        weatherImgSrc =
                            "'images/part_clouds_night.png'";
                    }
                }
            } else if (weather_id >= 900 && weather_id <= 949) {
                if (weather_id == 900) {
                    eng_weather = 'Tornado';
                    zh_weather = '龙卷风';
                    weatherImgSrc = "'images/tornado.png'";
                } else if (weather_id == 901) {
                    eng_weather = 'Tropical Storm';
                    zh_weather = '热带风暴';
                    weatherImgSrc = "'images/rain.png'";
                } else if (weather_id == 902) {
                    eng_weather = 'Hurricane';
                    zh_weather = '飓风';
                    weatherImgSrc = "'images/hurricane.png'";
                } else if (weather_id == 903) {
                    eng_weather = 'Extreme Cold';
                    zh_weather = '寒冷';
                    weatherImgSrc = "'images/low_temp.png'";
                } else if (weather_id == 904) {
                    eng_weather = 'Extreme Heat';
                    zh_weather = '炎热';
                    weatherImgSrc = "'images/high_temp.png'";
                } else if (weather_id == 905) {
                    eng_weather = 'High Winds';
                    zh_weather = '大风';
                    weatherImgSrc = "'images/wind.png'";
                } else if (weather_id == 906) {
                    eng_weather = 'Hail';
                    zh_weather = '冰雹';
                    weatherImgSrc = "'images/hail.png'";
                }
            } else if (weather_id >= 950 && weather_id <= 999) {
                if (weather_id == 951) {
                    eng_weather = 'Calm';
                    zh_weather = '';
                    if (daytime) {
                        weatherImgSrc = "'images/sun.png'";
                    } else {
                        weatherImgSrc = "'images/night_clear.png'";
                    }
                } else if (weather_id >= 952 && weather_id <= 954) {
                    eng_weather = 'Breeze';
                    zh_weather = '微风';
                    if (daytime) {
                        weatherImgSrc = "'images/sun.png'";
                    } else {
                        weatherImgSrc = "'images/night_clear.png'";
                    }
                } else if (weather_id >= 955 && weather_id <= 959) {
                    eng_weather = 'Wind';
                    zh_weather = '有风';
                    weatherImgSrc = "'images/wind.png'";
                    if (weather_id >= 957) {
                        eng_weather = 'High Winds';
                        zh_weather = '大风';
                    }
                } else if (weather_id == 960 || weather_id == 961) {
                    eng_weather = 'Storm';
                    zh_weather = '暴雨';
                    weatherImgSrc = "'images/lightning.png'";
                } else if (weather_id == 962) {
                    eng_weather = 'Hurricane';
                    zh_weather = '飓风'; // is this correct?
                    weatherImgSrc = "'images/hurricane.png'";
                }
            }

            if (weatherImgSrc == "'images/sun.png'") {
                extraRightPadding = '1.0vw';
            } else if (weatherImgSrc == "'images/night_clear.png'") {
                extraRightPadding = '1.0vw';
            } else if (weatherImgSrc == "'images/lightning.png'") {
                extraRightPadding = '0.0vw';
            } else if (weatherImgSrc == "'images/rain.png'") {
                extraRightPadding = '1.1vw';
            } else if (weatherImgSrc == "'images/snow.png'") {
                extraRightPadding = '1.4vw';
            } else if (weatherImgSrc == "'images/clouds.png'") {
                extraRightPadding = '0vw';
            } else if (weatherImgSrc == "'images/night_haze.png'") {
                extraRightPadding = '0.8vw';
            } else if (weatherImgSrc == "'images/day_haze.png'") {
                extraRightPadding = '0vw';
            } else if (weatherImgSrc == "'images/fog.png'") {
                extraRightPadding = '0.3vw';
            } else if (weatherImgSrc == "'images/tornado.png'") {
                extraRightPadding = '0.8vw';
            } else if (weatherImgSrc == "'images/part_sun.png'") {
                extraRightPadding = '0.8vw';
            } else if (weatherImgSrc ==
                "'images/part_clouds_night.png'") {
                extraRightPadding = '0.2vw';
            } else if (weatherImgSrc == "'images/hurricane.png'") {
                extraRightPadding = '1.4vw';
            } else if (weatherImgSrc == "'images/wind.png'") {
                extraRightPadding = '1.4vw';
            } else if (weatherImgSrc == "'images/low_temp.png'") {
                extraRightPadding = '1.5vw';
            } else if (weatherImgSrc == "'images/high_temp.png'") {
                extraRightPadding = '1.7vw';
            } else if (weatherImgSrc == "'images/hail.png'") {
                extraRightPadding = '0.9vw';
            } else if (weatherImgSrc == "'images/hail.png'") {
                extraRightPadding = '0.9vw';
            }

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
                    // AQI = 301;
                    // temperature = '00';
                    if (AQI <= 50) {
                        eng_aqi_desc = 'Good';
                        zh_aqi_desc = '健康';
                        color =
                            'background: linear-gradient(180deg, #00A300, #007E00);';
                        text = '#C6C1B7';
                    } else if (AQI > 50 && AQI <= 100) {
                        eng_aqi_desc = 'Moderate';
                        zh_aqi_desc = '中等';
                        color =
                            'background: linear-gradient(180deg, #FFAF00, #C7A000);';
                    } else if (AQI > 100 && AQI <= 150) {
                        eng_aqi_desc =
                            'Unhealthy for Sensitive Groups';
                        zh_aqi_desc = '对敏感人群不健康';
                        color =
                            'background: linear-gradient(180deg, #FFA200, #CF7200);';
                    } else if (AQI > 150 && AQI <= 200) {
                        eng_aqi_desc = 'Unhealthy';
                        zh_aqi_desc = '不健康 ';
                        color =
                            'background: linear-gradient(180deg, #A91B00, #890B00);';
                        text = '#C6C1B7';
                    } else if (AQI > 200 && AQI <= 300) {
                        eng_aqi_desc = 'Very Unhealthy';
                        zh_aqi_desc = '非常不健康';
                        color =
                            'background: linear-gradient(180deg, #4D0036, #430029);';
                        text = '#C6C1B7';
                    } else if (AQI > 300) {
                        eng_aqi_desc = 'Hazardous';
                        zh_aqi_desc = '危险';
                        color =
                            'background: linear-gradient(180deg, #542100, #330600);';
                        text = '#C6C1B7';
                    }

                    thispart = document.getElementById(
                        'eng_desc');
                    thispart.innerHTML = eng_weather;

                    thispart = document.getElementById(
                        'zh_desc');
                    thispart.innerHTML = zh_weather;

                    thispart = document.getElementById(
                        'weatherimageHolder');
                    thispart.innerHTML =
                        '<img class="nomarginstuff" id="weatherimage" style="padding-right: ' +
                        extraRightPadding + '" src=' +
                        weatherImgSrc + '>';

                    thispart = document.getElementById(
                        'temp_number');
                    thispart.innerHTML = temperature + '˚';

                    if (AQI > -1) { // this will prevent it from showing any negative numbers (negative numbers are false data)
                        thispart = document.getElementById(
                            'aqi_boxHolder');
                        thispart.innerHTML =
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
                            zh_aqi_desc + '</p>' + '</div>';
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
                        theEvent = document.getElementById(
                            'event' + String(i + 1));
                        if (data[i].location ==
                            'No location has been entered for this event.'
                        ) {
                            data[i].location =
                                'Location To Be Determined';
                        }
                        theEvent.innerHTML = (
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
        document.getElementById("contentpane").style.display = "inline";

    } //end refresh()

    refresh();
    setInterval(function() {
        refresh(); //this will run after every certain time
    }, 600000); //10mins



}); // end $(window).load