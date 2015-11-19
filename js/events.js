define(['d3', 'constants'], function(d3, constants){
    function setevents(data) {
        var datestrings = [];

        for (var i in data) {
                var startdate = data[i]["start_time"];
                var enddate   = data[i]["end_time"];
                var datestr = "{wkday}, {enmonth} {date} | {month}月{date}日 {cnwkday}";
                datestr = constants.format(datestr, {
                    wkday  : constants.weekdays_en[startdate[5]],
                    enmonth: constants.months_en[startdate[1]-1],
                    date   : startdate[2],
                    month  : startdate[1],
                    cnwkday: constants.weekdays_zh[startdate[5]]
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
                    timestr = constants.format(timestr, {
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

    function doevents() {
        d3.json("cherrypy/events", function(e,data) {setevents(data);});
    }
    return doevents
});