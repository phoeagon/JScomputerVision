// print process.argv

var fs = require('fs');
var Canvas = require('canvas')

var brush = require('./lib/brush.js')
var CV = require('./lib/cv.js')

var sobel = [] ,
	 compass = [] ,
	 roberts = [] ,
	 names = []
	 ;

function parse( filename , index ){
	names . push( filename )
	fs.readFile( filename , function(err, data) {
		if (err) throw err;
        var img = new Canvas.Image; // Create a new Image
        img.src = data;
        var canvas = new Canvas(img.width, img.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage( img, 0, 0, img.width , img.height );
        
		var T = new CV( ctx.getImageData( 0 , 0 , img.width , img.height ) );		
		var tmp = T.sobel_hog();
		var ss = [];
		for ( var i in tmp ){
			ss[180+Math.round(i*360)]= tmp[i] ;
		}
		sobel . push( ss );
		
		var T = new CV( ctx.getImageData( 0 , 0 , img.width , img.height ) );		
		var tmp = T.compass_hog();
		var ss = [];
		for ( var i in tmp ){
			ss[180+Math.round(i*360)]= tmp[i] ;
		}
		compass . push( ss );
		
		var T = new CV( ctx.getImageData( 0 , 0 , img.width , img.height ) );	
		var tmp = T.roberts_hog();
		var ss = [];
		for ( var i in tmp ){
			ss[180+Math.round(i*360)]= tmp[i] ;
		}
		roberts . push( ss );
		
		console.log(filename+" done!");
		console.log("");
		
		if ( index == process.argv.length-1 )
			print_result();
		}
	)
}


console.log("Usage: node app.js [name of your files]");
console.log("");
console.log("This application takes in your images and output the texture characteristic vector using Sobel, Roberts and Compass operator.");
process.argv.forEach(function (val, index, array) {
  //console.log(index + ': ' + val);
  if (index > 1 ){
      parse( val , index );
  }
});

function print_result(){
	
	console.log("");
	console.log("");
	console.log("Names: ");
	for ( var i in names ){
		console.log( names[i] )
	}
	console.log("");
	console.log("");
	console.log("Sobel: ");
	for ( var i in sobel ){
		console.log( sobel[i] )
	}
	console.log("");
	console.log("");
	console.log("Roberts: ");
	for ( var i in roberts ){
		console.log( roberts[i] )
	}
	console.log("");
	console.log("");
	console.log("Compass: ");
	for ( var i in compass ){
		console.log( compass[i] )
	}

}

