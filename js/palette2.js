var paletteColors = 4;
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

        //TODO: scale in a proper way, ёпта
        var canvas = document.getElementById('mycanvas');
        wx = (img.width > 500) ? 500 : img.width;
        wx = img.width;
        hx = img.height;


        if (img.width > 500  && img.width<img.height)
        {
            wx = 500;
        } else if (img.height > 500   && img.width>img.height)
        {
            hx = 500;
        }

        canvas.setAttribute('width', wx);
        canvas.setAttribute('height', hx);

        var context = canvas.getContext('2d');
        if (!context || !context.putImageData) {
            console.log('cant get context');
            return;
        }


        context.drawImage(img, 0, 0, wx, hx); //image is loaded ook.
        var palette = getPalette(context, paletteColors);
        oldData = context.getImageData(0,0, canvas.width, canvas.height);
        oldX = canvas.width;
        oldY = canvas.height;
        canvas.height = (canvas.height + 500);
        canvas.getContext('2d').putImageData(oldData,0,0);

        drawPalette(context, palette, [oldX, oldY] );
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

        return cmap.palette().map(
            function(v){
                return( "#" + v[0].toString(16) + v[1].toString(16) + v[2].toString(16) );
            }
        ).sort();
    }

    function sortPalette(list)
    {

    }

    function drawPalette(ctx, palette, coords)
    {
        console.debug(ctx);
        var startX = 0
            , startY = coords[1]
            , box = 15
            , boxWidth  = box
            , boxHeight = box;
        console.debug(startX, startY, coords);

        $.each(palette, function(k,v) {
            //var fillStyle = "#" + v[0].toString(16) + v[1].toString(16) + v[2].toString(16);
            ctx.fillStyle = v;
            ctx.fillRect (startX,startY,boxWidth,boxHeight);
            ctx.stroke();
            ctx.font = "12px sans-serif";
            ctx.fillStyle = '#000';
            ctx.fillText(v, startX + boxWidth*1.2, startY + boxHeight);
            startY += box;

        });
        ctx.fillStyle = '#65605c';
    }
}


$(document).ready(function(){
    $('#btnLoad').click(function(){
        loadImage();
        //imager.getColors();
    });
});
