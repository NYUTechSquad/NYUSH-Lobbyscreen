define(['d3', 'jquery', 'constants', 'weatherdata'], function(d3, _, constants, weatherdata){
    WEATHERDATA = weatherdata.weathernames;
    PADDINGDATA = weatherdata.padding;
    AQIFORMATTING = weatherdata.aqi;

    function updateclock() {
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
                                .text(constants.weekdays_en[ww] + ', ' + constants.months_en[mm] + " " + dd);
        dateheader.append("div").attr("class","nomarginstuff date")
                                .text((mm + 1) + '月' + dd + '日' + ",  " + constants.weekdays_zh[ww]);
        $("#clock").html('' + h + ":" + m + " " + AP + '');
    }

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

    function dosidebar() {
        updateclock();
        window.setInterval(updateclock, 1000);
        d3.json("cherrypy/weather", function(e,data){setweather(data);});        
    }

    return dosidebar;
});