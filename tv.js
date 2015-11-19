define(['d3', 'jquery', 'sidebar', 'events', 'announcements'], function(
    d3, $, sidebar, events, announcements){
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
    function refresh() {
		sidebar();
        events();
        announcements();
        onWindowResize();
    }
    refresh();    
    setInterval(refresh, 1000 * 60 * 10); // refresh every 10mins
    var eventdur = 30000;
    var announcedur = 60000;
    animateslides(eventdur, announcedur);
    setInterval(function(){animateslides(eventdur, announcedur);}, eventdur+announcedur); // each slide lasts for a minute and 4.
}

return onload;
}); // end of the define() callback