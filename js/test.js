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
	loadImg();

	var queue = [] ; //execution queue
	var Tb , Tc , T , Td , Tmask;
	$('#progress_splash').css('display','block');
	queue.push( function(){
		T = new CV( getImageData() );
		Tb = T.clone();
	} );
	queue.push( function(){
		Tb.threshold(90);
		showCV( Tb ) ;
		Tc = Tb.clone();
	})
	//L3=L.clone();L2=L.clone();showCV(L2.closeth(brush.rect(1,1)).threshold(20).intersect(L3.threshold(120)))
	var i = 20;
	while ( i-- > 0 ){
		queue.push( function(){
			Tc.thin();
		})
		if ( i % 3 == 0 )
			queue.push( function(){
				showCV( Tc );
			} )
	}
	queue.push( function(){
		Td = T.clone();
		Td.openth( brush.thinfg(1) );
		Td.threshold( 13 );
		//showCV( Td ) ;
		Tmask = Tb.clone().threshold(110).close(brush.cross(1,1)).erode(brush.circle(3));
		//showCV( Tmask );
		Td.intersect( Tmask );
		showCV( Td ) ;
	} )
	queue.push( function(){
		Td.map( function( arr ){
			if ( arr[0]<20 )
				arr[3] = 0 ;//alpha (transparent!)
			else{
				arr[0]=0;
			}
			return arr;
		} )
	})
	queue.push( function(){
		Tc.map( function( arr ){
			if ( arr[0]<20 )
				arr[3] = 0 ;//alpha (transparent!)
			else{
				arr[1]=0;
			}
			return arr;
		} )
	} ) 
	queue.push( function(){
		var F = T.clone();
		//showCV( T.diff(Td) );
		showCV( T.diff(Tc).diff(Td) );
		$('#progress_splash').css('display','none');
	})
	function run( ind ){
		console.log( "run "+ind );
		if ( queue[ind]==null )
			return ;
		queue[ind]();	//execute
		setTimeout( function(){run(ind+1)} , 100 );
	}
	run( 0 );
}
function showCV( T , noclear ){
	if ( noclear == null || noclear == false )
		canvasContext.clearRect(0,0,canvas.width,canvas.height);
	canvasContext.putImageData( 
		 T.getImgData() ,
		0 , 0 ) // draw image back to canvas
}
function testConvolution(){
	var T = new CV( getImageData() );
	var br = brush.sobelx();
	result = {};
	T.convolution( br , result );
	console.log( result[0] )
	
}
function testSobel(){
	var T = new CV( getImageData() );
	var result = {};
	showCV( T.sobel() );
}
function testSobelHOG(){
	var T = new CV( getImageData() );
	var result = T.sobel_hog();
	var tmp = [];
	for ( var i in result )
		tmp.push( [ (i*360) , result[i] ] );
	//sort for better display
	tmp.sort(function(a,b) { return a[0]-b[0]; } );
	console.log( tmp );
	$.plot("#placeholder", [ { 
		bars: { show: true } ,
		data : tmp
		} ] );
	return tmp ;
}
