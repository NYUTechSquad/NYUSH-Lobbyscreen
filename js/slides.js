// handles: transitions between slides, and scrolling within a slide
define(['d3', 'jquery'], function(d3, $) {
    function scrollTween(target) {
        return function() {
            var i = d3.interpolateNumber(this.scrollTop, target);
            return function(t) {this.scrollTop = i(t);};
        };
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

    return {
        animateslides: animateslides
    };
})