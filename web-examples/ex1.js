var Chart = require('chart');
var ee = require('events').EventEmitter;
var through = require('through');
var x = through(
    function write(data) { 
        this.queue(data);
    },
    function end() {
        this.queue(null)
    }
);
var windowsum = function(queue,k) {
    var s = 0;
    for (var i = queue.length - (2*k - 1); i < queue.length; i++) {
        s += queue[i];
    } 
    return s;
};
var dsp = function(type) {
    var queue = [];
    this.filters = {
        boxcar :through(
            function write(data) {
                queue.push(data);
                if (queue.length >= 2*5-1) {
                    queue[queue.length - 5] = windowsum(queue,5) / (2*5 - 1);
                    this.queue(queue[queue.length - 5]);
                }
            }, 
            function end() {
                this.queue(null)
            })
    };
    return this.filters.boxcar
}
x.tick = 0;
setInterval(function() {
    var sign = (Math.random() >= 0.5) ? 1 : -1;
    var noise = sign*(Math.random() * 0.05);
    x.write(Math.sin((x.tick/100)*Math.PI) + noise);
    x.tick++;
    if (x.tick == 100) 
        x.tick = 0;
}, 100);

var chart = new Chart;
var datasource = new ee;
var datasource2 = new ee;
//chart.color.line = ['#FF0000','#0033FF'];
chart.color.grid = '#c9d6de'; // a pleasant grid
chart.color.xlabel = '#FFF'; // the color of the x-axis labels
chart.color.xline = '#FFF'; // the color the x-axis line
chart.color.ylabel = '#FFF'
chart.color.yline = '#FFF';
chart.color.interactionline = '#FFF';
chart.series(datasource);
chart.series(datasource2);
chart.color.bg = '#000000';
chart.to(document.getElementById('c1'));
chart.legend(document.getElementById('legend'));


x.pipe(through(
    function write(data) {
        datasource.emit('data',{noisy:data});
    },
    function end() {
        this.queue(null);
    }
));

x.pipe(dsp('boxcar')).pipe(through(
    function write(data) {
        datasource2.emit('data',{cleaner:data});
    },
    function end() {
        this.queue(null);
    }
));
