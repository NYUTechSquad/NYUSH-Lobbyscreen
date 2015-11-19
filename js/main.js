requirejs.config({
    baseUrl: 'js',
    paths: {
        d3: "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.9/d3.min",
        jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min"
    }
});

require([
    'tv'
], function(tv) {
    tv();
});