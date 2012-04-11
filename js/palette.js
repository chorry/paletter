/* ALG:
Calculate histograms of R/G/B channels
Define 4 intensity ranges
For each channel in intensity range
  Split histogram into 4 equal parts
  For each histogram part
    Extract most frequent value of that part
*/

function loadImage() {
    var input, file, fr, img;

    if (typeof window.FileReader !== 'function') {
        console.log("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('imgfile');
    if (!input) {
        console.log("Um, couldn't find the imgfile element.");
    }
    else if (!input.files) {
        console.log("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        console.log("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = createImage;
        fr.readAsDataURL(file);
    }

    function createImage() {
        img = document.createElement('img');
        img.onload = imageLoaded;
        img.style.display = 'none'; // If you don't want it showing
        img.src = fr.result;
        document.body.appendChild(img);
    }

    function imageLoaded() {
        console.log(img.width + "x" + img.height);
        //load image into canvas

        var canvas = document.getElementById('mycanvas');

        var context = canvas.getContext('2d');
        if (!context || !context.putImageData) {
            console.log('cant get context');
            return;
        }

        context.drawImage(img, 0,0, 150, 150);

        // create a new pixel array
        var imgd = context.getImageData(0,0, 150,150);
        var pix = imgd.data;
        var MASK;
        //MASK = 0xFFF0F0F0; // 4 bits per channel
        //MASK = 0xFFE0E0E0; // 3 bits per channel
        MASK = 0xffc0c0c0; // 2 bits per channel
        // Loop over each pixel and count colors
        var paletteRoot = {};
        var Histo = {};
        var HistoParse = {};
        var HistoVals = {};
        var HistoRGB = {red: [], green: [], blue: [] };
        for (var i = 0; n = pix.length, i < n; i += 4) {
//Adobe Photoshop's Luminocity formula (http://www.clearps.com/photoshop-forum/index.php/t/65378/): .3R + 0.59G + .11B
          pix[i  ] &= MASK; // red   channel
          pix[i+1] &= MASK; // green channel
          pix[i+2] &= MASK; // blue  channel

            var idx =       pix[i  ] * 256*256 + pix[i+1]*256 + pix[i+2];
            var idxHist =   pix[i  ] * 0.3 + pix[i+1]*0.59 + pix[i+2] * 0.11;
          //calc colors
          paletteRoot[idx] = (paletteRoot[idx] + 1) || 1;
          Histo    [ parseInt(idxHist) ] = (Histo[parseInt(idxHist)] + 1) || 1;
          HistoVals[ parseInt(idxHist) ] = idx;
          HistoRGB.red.push(pix[i]);
          HistoRGB.green.push(pix[i+1]);
          HistoRGB.blue.push(pix[i+2]);
        }

        console.debug(Histo);
        console.debug(HistoParse);
        console.debug(HistoVals);
        console.log('---');
        drawHisto('hist_canvas', Histo, HistoVals, 7);
        //get 4 intensity ranges
        $.each(Histo, function(k,v){
        });

        // Draw the ImageData object at the given (x,y) coordinates.
        context.putImageData(imgd, 0,0);

        //remove the rest
        img.parentNode.removeChild(img);
        img = undefined;
    }

    function drawHisto(canvasId, data, Legend, maxColors)
    {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        canvas.setAttribute('width',255);
        canvas.setAttribute('height',255)

        var bh = new binaryHeap();
        //draw histo and remember 4 max values;
        $.each(data, function(k,v) {
           var hexColor = k.toString(16);
           bh.push(k);
           ctx.strokeStyle = "#" + hexColor;
           ctx.beginPath();
           ctx.moveTo(k, canvas.height - 0);
           ctx.lineTo(k, canvas.height - (v/10));
           ctx.stroke();
        })

        if (typeof Legend == 'object')
        {
            console.debug(Legend);
            //draw color images
            for (var i = 0; i < maxColors; i += 1)
            {
              var color = bh.pop();
              var hexColor = Legend[color].toString(16);
                ctx.fillStyle = "#" + hexColor;
                var box = 20;
                var step = box*i;
                ctx.fillRect (step,step+box,box,box);
                ctx.stroke();
            }
        }

    }

    function countColors (arg)
    {
        console.log('got arg!');
    }

    var binaryHeap = function(comp) {

      // default to max heap if comparator not provided
      comp = comp || function(a, b) {
        return a > b;
      };

      var arr = [];

      var swap = function(a, b) {
        var temp = arr[a];
        arr[a] = arr[b];
        arr[b] = temp;
      };

      var bubbleDown = function(pos) {
        var left = 2 * pos + 1;
        var right = left + 1;
        var largest = pos;
        if (left < arr.length && comp(arr[left], arr[largest])) {
          largest = left;
        }
        if (right < arr.length && comp(arr[right], arr[largest])) {
          largest = right;
        }
        if (largest != pos) {
          swap(largest, pos);
          bubbleDown(largest);
        }
      };

      var bubbleUp = function(pos) {
        if (pos <= 0) {
          return;
        }
        var parent = Math.floor((pos - 1) / 2);
        if (comp(arr[pos], arr[parent])) {
          swap(pos, parent);
          bubbleUp(parent);
        }
      };

      var that = {};

      that.pop = function() {
        if (arr.length === 0) {
          throw new Error("pop() called on emtpy binary heap");
        }
        var value = arr[0];
        var last = arr.length - 1;
        arr[0] = arr[last];
        arr.length = last;
        if (last > 0) {
          bubbleDown(0);
        }
        return value;
      };

      that.push = function(value) {
        arr.push(value);
        bubbleUp(arr.length - 1);
      };

      that.size = function() {
        return arr.length;
      };

      return that;
    };
}

function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}


// RESIZE ALGO
//USAGE: new thumbnailer(canvas, img, 150, 1); //this produces lanczos1
//returns a function that calculates lanczos weight
function lanczosCreate(lobes){
  return function(x){
    if (x > lobes)
      return 0;
    x *= Math.PI;
    if (Math.abs(x) < 1e-16)
      return 1
    var xx = x / lobes;
    return Math.sin(x) * Math.sin(xx) / x / xx;
  }
}

//elem: canvas element, img: image element, sx: scaled width, lobes: kernel radius
function thumbnailer(elem, img, sx, lobes){
    this.canvas = elem;
    elem.width = img.width;
    elem.height = img.height;
    elem.style.display = "none";
    this.ctx = elem.getContext("2d");
    this.ctx.drawImage(img, 0, 0);
    this.img = img;
    this.src = this.ctx.getImageData(0, 0, img.width, img.height);
    this.dest = {
        width: sx,
        height: Math.round(img.height * sx / img.width),
    };
    this.dest.data = new Array(this.dest.width * this.dest.height * 3);
    this.lanczos = lanczosCreate(lobes);
    this.ratio = img.width / sx;
    this.rcp_ratio = 2 / this.ratio;
    this.range2 = Math.ceil(this.ratio * lobes / 2);
    this.cacheLanc = {};
    this.center = {};
    this.icenter = {};
    setTimeout(this.process1, 0, this, 0);
}

thumbnailer.prototype.process1 = function(self, u){
    self.center.x = (u + 0.5) * self.ratio;
    self.icenter.x = Math.floor(self.center.x);
    for (var v = 0; v < self.dest.height; v++) {
        self.center.y = (v + 0.5) * self.ratio;
        self.icenter.y = Math.floor(self.center.y);
        var a, r, g, b;
        a = r = g = b = 0;
        for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
            if (i < 0 || i >= self.src.width)
                continue;
            var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
            if (!self.cacheLanc[f_x])
                self.cacheLanc[f_x] = {};
            for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
                if (j < 0 || j >= self.src.height)
                    continue;
                var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
                if (self.cacheLanc[f_x][f_y] == undefined)
                    self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2) + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
                weight = self.cacheLanc[f_x][f_y];
                if (weight > 0) {
                    var idx = (j * self.src.width + i) * 4;
                    a += weight;
                    r += weight * self.src.data[idx];
                    g += weight * self.src.data[idx + 1];
                    b += weight * self.src.data[idx + 2];
                }
            }
        }
        var idx = (v * self.dest.width + u) * 3;
        self.dest.data[idx] = r / a;
        self.dest.data[idx + 1] = g / a;
        self.dest.data[idx + 2] = b / a;
    }

    if (++u < self.dest.width)
        setTimeout(self.process1, 0, self, u);
    else
        setTimeout(self.process2, 0, self);
};
thumbnailer.prototype.process2 = function(self){
    self.canvas.width = self.dest.width;
    self.canvas.height = self.dest.height;
    self.ctx.drawImage(self.img, 0, 0);
    self.src = self.ctx.getImageData(0, 0, self.dest.width, self.dest.height);
    var idx, idx2;
    for (var i = 0; i < self.dest.width; i++) {
        for (var j = 0; j < self.dest.height; j++) {
            idx = (j * self.dest.width + i) * 3;
            idx2 = (j * self.dest.width + i) * 4;
            self.src.data[idx2] = self.dest.data[idx];
            self.src.data[idx2 + 1] = self.dest.data[idx + 1];
            self.src.data[idx2 + 2] = self.dest.data[idx + 2];
        }
    }
    self.ctx.putImageData(self.src, 0, 0);
    self.canvas.style.display = "block";
}

$(document).ready(function(){
    $('#btnLoad').click(function(){
        loadImage();
        //imager.getColors();
    });
});


