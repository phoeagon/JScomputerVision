// `test.js` The main test script
//-------------------------------------------
//
//  by Qiu Zhe ( phoeagon_AT_gmail.com )
//
// This file contains test cases.
//
//--------------------------------------------------------
//

// ## testGrayscale
//
// This routine loads a colorful RGB picture, then attempt
// to use the CV lib to create a grayscale version, which
// would then be printed onto the canvase
// 
function testGrayscale(){
	$('#imgLoad').attr('src','./img/color.jpg').load(
		function(){
			loadImg();
			var T = new CV(getImageData());
			canvasContext.putImageData( 
				T .grayscale().getImgData(), 
				/* draw at offset ( 10 ,10 )*/ 10,10 )
			$('#imgLoad').unbind('load');//remove handler
		}
	)
}
//
//------------------------------------------------------------
//
// ## testErode
//
// This routine tests the erosion routine of the CV lib.
// It assumes that currently there's a thresholded ( single-valued )
// image on canvas.
//
// Tested param: rectangular brush of (3,3), fitting white
// (255,255,255) as foreground color
//
function testErode(){
	var T = new CV( getImageData() );
	var b = new Object( brush.rect( 3 , 3 ) );//brush of a rectangular (3,3)
	var dt = T.erode( b , [255,255,255]  ).getImgData();//get processed data
	console.log( dt );
	canvasContext.putImageData( 
		 dt ,
		0 , 0 ) // draw image back to canvas
}
//
//------------------------------------------------------------
//
// ## testDilate
//
// This routine tests the dilation routine of the CV lib.
// It assumes that currently there's a thresholded ( single-valued )
// image on canvas.
//
// Tested param: rectangular brush of (3,3), fitting white
// (255,255,255) as foreground color
//
function testDilate(){
	var T = new CV( getImageData() );
	var b = new Object( brush.rect( 3 , 3 ) );//brush of a rectangular (3,3)
	var dt = T.dilate( b , [255,255,255]  ).getImgData();//get processed data
	console.log( dt );
	canvasContext.putImageData( 
		 dt ,
		0 , 0 ) // draw image back to canvas
}

function potato(){//WTF!
	var T = new CV( getImageData() );
	
}
