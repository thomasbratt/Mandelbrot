// ----------------------------------------------------------------------------
// Displays a zoomable plot of the Mandelbrot set.
// ----------------------------------------------------------------------------

var ZOOM_FACTOR = 0.7;

var Mandelbrot = function(canvas){
    this._canvas = canvas || document.getElementsByTagName('canvas')[0];
    this._currentOriginReal = 0.0;
    this._currentOriginImaginary = 0.0;
    this._currentRadius = 2.0;
}

Mandelbrot.prototype.start = function(){
    this._registerClickHandler();
    this._render();
}

Mandelbrot.prototype._render = function(){
    var start = new Date();

    var c = this._getCanvas();
    var values = this._getSet(  this._currentOriginReal,
                                this._currentOriginImaginary,
                                this._currentRadius,
                                c.width,
                                c.height,
                                c.size);
    this._plot(values);

    var elapsed = (new Date() - start);
    console.log('Rendered in: ' + elapsed + 'ms');
}

Mandelbrot.prototype._getSet = function(or, oi, radius, width, height, size){
    var values = [];
    values.length = size;
    var index=0;

    var scaleX = (2.0 * radius) / width;
    var scaleY = (2.0 * radius) / height;

    for(var y=0; y<height; ++y){
        for(var x=0; x<width; ++x){
            var cr = (or - radius) + x * scaleX,
                ci = (oi - radius) + y * scaleY,
                zr = 0.0,
                zi = 0.0,
                k;
            for(k=0; k<255; ++k){
                var zr2 = zr * zr;
                var zi2 = zi * zi;

                if(zr2 + zi2 >= 4.0){
                    break;
                }                

                var znr = zr2 - zi2 + cr;
                var zni = 2.0 * (zr * zi) + ci;
                zr = znr;
                zi = zni;
            }

            values[index++] = k;
        }
    }

    return values;
}

Mandelbrot.prototype._plot = function(values){
    var c = this._getCanvas();
    var size = c.size;
    var pixels = c.pixels;
    var pixelIndex = 0;

    for(var index = 0; index<size; ++index){
        var value = values[index];

        // Monochrome palette.
        pixels[pixelIndex++] = value;
        pixels[pixelIndex++] = value;
        pixels[pixelIndex++] = value;
        pixels[pixelIndex++] = 255;
    }
    
    c.ctx.putImageData(c.imageData, 0, 0);
}

Mandelbrot.prototype._getCanvas = function(){
    var ctx = this._canvas.getContext("2d");
    var width = this._canvas.width;
    var height = this._canvas.height;
    var imageData = ctx.getImageData(0, 0, width, height);

    return {
        ctx: ctx,
        width: width,
        height: height,
        size: width * height,
        imageData: imageData,
        pixels: imageData.data
    }
}

Mandelbrot.prototype._registerClickHandler = function(){
    var self = this;
    this._canvas.addEventListener('click', function(evt) {
        self._onClick.call(self, evt);
    }, false);
}

Mandelbrot.prototype._onClick = function(evt){
    var rect = this._canvas.getBoundingClientRect();
    var pos = {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };

    this._movePosition(pos.x, pos.y);    
    this._render();
}

Mandelbrot.prototype._movePosition = function(x, y){
    var c = this._getCanvas();
    var width = c.width;
    var height = c.height;

    var nx = (2.0 * this._currentRadius * x) / width;
    var ny = (2.0 * this._currentRadius * y) / height;

    this._currentOriginReal += (nx - this._currentRadius);
    this._currentOriginImaginary += (ny - this._currentRadius);
    this._currentRadius *= ZOOM_FACTOR;
}
