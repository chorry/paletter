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
        wx = (img.width > 500) ? 500 : img.width;
        hx = img.height;
        if (img.width > 500  && img.width<img.height)
        {
            wx = 500;
        } else if (img.height > 500   && img.width>img.height)
        {
            hx = 500;
        }
        console.log(wx + 'X' + hx);
        canvas.setAttribute('width', wx);
        canvas.setAttribute('height', hx);

        var context = canvas.getContext('2d');
        if (!context || !context.putImageData) {
            console.log('cant get context');
            return;
        }


        context.drawImage(img, 0, 0, wx, hx); //image is loaded ook.
        var palette = getPalette(context, 8);
        drawPalette(document.getElementById('hist_canvas').getContext('2d'), palette);
    }

    function getPalette(ctx, colors) {
        var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
            pixels = imgData.data;

        var pixArray = [];
        for (var i = 0; n = pixels.length, i < n; i += 4) {
            if ( pixels[i  + 3] >= 125
                && !(pixels[i + 3] > 250
                && pixels[i + 1] > 250
                && pixels[i + 2] > 250)
                )
            {
                pixArray.push( [ pixels[ i ], pixels[ i + 1 ], pixels[ i + 2 ] ] );
            }
        }

        var cmap = MMCQ.quantize(pixArray, colors);
        return cmap.palette();
    }

    function drawPalette(ctx, palette)
    {
        console.debug(ctx);
        var step = 20;
        var start = 0;
        $.each(palette, function(k,v){
            var fillStyle = "#" + v[0].toString(16) + v[1].toString(16) + v[2].toString(16);
            console.log(fillStyle);
            ctx.fillStyle = fillStyle;
            var box = 40;
            ctx.fillRect (start,box+box,50,box);
                start += 40;
            ctx.stroke();
        });
        ctx.fillStyle = '#65605c';
        //ctx.fillRect(10,10,70,70);
    }

}


$(document).ready(function(){
    $('#btnLoad').click(function(){
        loadImage();
        //imager.getColors();
    });
});
