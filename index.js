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
    return through(
        function write(data) { 
            queue.push(data);
            if (queue.length >= 2*5-1) {
                queue[queue.length - 5] = windowsum(queue,5) / (2*5 - 1);
                this.queue(queue[queue.length - 5] + " ");
            }
        },
        function end() {
            this.queue(null)
        }
    );
}

setInterval(function() {
    var val = ~~(Math.random() * 99);
    x.write(val);
//}, ~~(Math.random() * 999));
}, 100);

x.pipe(dsp('boxcar')).pipe(process.stdout);
