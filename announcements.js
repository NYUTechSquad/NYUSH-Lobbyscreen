define(['d3', 'jquery', 'constants'], function(d3, _, constants) {
    function setannouncements(data) {
        var datestrings = [];

        for (var i in data) {
                var startdate = data[i].startdate;
                var enddate   = data[i].enddate;
                var datestr = "{wkday}, {enmonth} {date} | {month}月{date}日 {cnwkday}";
                datestr = datestr.format({
                    wkday  : constants.weekdays_en[startdate[5]],
                    enmonth: constants.months_en[startdate[1]-1],
                    date   : startdate[2],
                    month  : startdate[1],
                    cnwkday: constants.weekdays_zh[startdate[5]]
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

    function doannouncements() {
        d3.json("cherrypy/announcements", function(e,data) {setannouncements(data);});
    }

    return doannouncements;
});