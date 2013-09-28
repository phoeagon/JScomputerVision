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
function testErode(){
	var T = new CV( getImageData() );
	var b = new Object( brush.rect( 3 , 3 ) );
	var dt = T.erode( b , [255,255,255]  ).getImgData();
	console.log( dt );
	canvasContext.putImageData( 
		 dt ,
		0 , 0 )
}
//
//------------------------------------------------------------
//
function testDilate(){
	var T = new CV( getImageData() );
	var b = new Object( brush.rect( 3 , 3 ) );
	var dt = T.dilate( b , [255,255,255]  ).getImgData();
	console.log( dt );
	canvasContext.putImageData( 
		 dt ,
		0 , 0 )
}
