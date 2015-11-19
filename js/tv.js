define(['d3', 'jquery', 'sidebar', 'events', 'announcements', 'slides'], function(
    d3, $, sidebar, events, announcements, slides){
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
    var announcedur = 90000;
    slides.animateslides(eventdur, announcedur);
    setInterval(function(){slides.animateslides(eventdur, announcedur);}, eventdur+announcedur); // each slide lasts for a minute and 4.
}

return onload;
}); // end of the define() callback