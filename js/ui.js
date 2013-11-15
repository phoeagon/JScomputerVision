// UI.js
//=====================================
//
//   by Qiu Zhe ( phoeagon_AT_gmail.com )
//
//  This file contains UI implementation for the CV project.
//

//
//------------------------------------------------------------
// ## Config placeholders
//
var imgParam = {
	width : 0 , 
	height : 0 
}
//
//------------------------------------------------------------
//
function drawHist( ImageCV ){
	var hist = ImageCV.histogram( true );
	var data = [];
	for ( var i=0; i < 256; ++i )
		data.push( [ i , hist[i] ] );
	//console.log( data );
	$.plot("#placeholder", [ { 
			bars: { show: true } ,
			data : data
			} ] );
}
function updateImg(){
	window.ImageCV = new CV( getImageData() );	//write to global variable
	$('#thresv').val( ImageCV.otsu() );
	drawHist( ImageCV );
}
//
//-------------------------------
//
function loadImg(){
	function autoSetParam(){
		$('#adaradius').val( Math.max( 10 , imgParam.width / 25 ) );
		$('#adagrid').val( Math.max( 10 , imgParam.width / 27 ) );
	}
	function fitDimensions(){
		imgParam = getOriginalImageDimension( $('#imgLoad')[0] )
		;// DEPRECATED: because this gets the 'resized' dimension of the image
		if ( $('#fullImg').is(':checked') ){
			var target_width = $('#canvas_col').width();
			var ratio = target_width / imgParam.width ;
			$('#myCanvas').css('zoom',ratio);//scale to fit
			autoSetParam();
		}
		else{ //preview image
			imgParam.width = $('#imgLoad')[0].width
			imgParam.height = $('#imgLoad')[0].height
			autoSetParam();	
			$('#myCanvas').css('transform','');//reset transform
			if ( $('#canvas_col').width() < imgParam.width ){
				imgParam.width = $('#canvas_col').width();
				imgParam.height = $('#imgLoad').height() *
						( imgParam.width / $('#imgLoad').width() )
			}
		}
		$('#myCanvas').attr('width' , imgParam.width );
		$('#myCanvas').attr('height' ,imgParam.height );
		
	}
	
	var c=canvas=$("#myCanvas")[0];
	var ctx=canvasContext=c.getContext("2d");
	var img=$("#imgLoad")[0];
	fitDimensions();

	ctx.drawImage(img,0,0,imgParam.width,imgParam.height);
	updateImg();
}
//
//------------------------------------------------------------
//
function getImageData(){
	return canvasContext.
			getImageData( 0 , 0 , imgParam.width , imgParam.height );
}

//
//------------------------------------------------------------
//
$(window).load( loadImg ); 
// $(document).load doesn't work here as we have to wait till image itself is loaded
//
//------------------------------------------------------------
//
$('#savedImg').click(
	function(e){
		var url = $('#myCanvas')[0].toDataURL();
		window.open(url);
		e.preventDefault();
	}
)
//
//------------------------------------------------------------
//
$('#switchImg').click(
	function(e){
		var url = $('#myCanvas')[0].toDataURL();
		$('#imgLoad').attr('src',url);
		e.preventDefault();
	}
)
//
//------------------------------------------------------------
//
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imgLoad').attr('src', e.target.result)
				.unbind('load').load( function(){
						loadImg();
					});
        }
        reader.readAsDataURL(input.files[0]);
    }
}

//
//------------------------------------------------------------
//
$('#imgInp').change(function(){
	readURL(this)
} )

//
//------------------------------------------------------------
//

function getOriginalImageDimension( img_element ) {
    var t = new Image();
    t.src = (img_element.getAttribute ? img_element.getAttribute("src") : false) || img_element.src;
    return {
		width:  t.width ,
		height: t.height
	};
}
//
//-------------------------------------------------------------
//
$('#grayscaleImg').click( function(){
	var ImageCV = new CV( getImageData() );
	canvasContext.putImageData( ImageCV.grayscale().getImgData() , 0 , 0 );
})
//
//--------------------------------------------------------------
//
$('#auto_thresholdImg').click( function(){
	//var ImageCV = new CV( getImageData() );
	var thres = ImageCV.otsu();
	$('#thresv').val( thres );
	$('#thresholdImg').click();
})
$('#thresholdImg').click( function(){
	//var ImageCV = new CV( getImageData() );
	var thres = $('#thresv').val();
	canvasContext.putImageData( ImageCV.threshold( thres ).getImgData() , 0 , 0 );
})
$('#reloadImg').click( function(){
	loadImg();
})
$('#erodebtn').click( function(){
	var radius = $('#radius').val();
	if ( $('input[name=brush]:checked').val()=='Square' ){
		var b = brush.rect( radius * 2 + 1 , radius * 2 + 1 );
	}else
		var b = brush.circle( radius );
	var ImageCV = new CV( getImageData() );
	canvasContext.putImageData( ImageCV.erode( b ).getImgData() , 0 , 0 );
})
$('#dilatebtn').click( function(){
	var radius = $('#radius').val();
	if ( $('input[name=brush]:checked').val()=='Square' ){
		var b = brush.rect( radius * 2 + 1, radius * 2 + 1 );
	}else
		var b = brush.circle( radius );
	var ImageCV = new CV( getImageData() );
	canvasContext.putImageData( ImageCV.dilate( b ).getImgData() , 0 , 0 );
})
$('#viewBrush').click( function(){
	var radius = $('#radius').val();
	if ( $('input[name=brush]:checked').val()=='Square' ){
		var b = brush.rect( radius * 2 + 1, radius * 2 + 1 );
	}else
		var b = brush.circle( radius );
	viewBrush( b );
})
function viewBrush( br ){
	var t = '' ;
	for ( var i in br.data ){
		t = t + ' ' + br.data[i] ; 
		if ( ((parseInt(i)+1) % br.w == 0)  )
			t += '<br/>'
	}
	window.open().document.write(t);
}

$('#invbtn').click( function(){
	var a = new CV(getImageData());
	canvasContext.putImageData( a.invert().getImgData() , 0 , 0 );
	drawHist( a );
})
$('#logbtn').click( function(){
	var a = new CV(getImageData());
	canvasContext.putImageData( a.log().getImgData() , 0 , 0 );
	drawHist( a );
})
$('#invlogbtn').click( function(){
	var a = new CV(getImageData());
	canvasContext.putImageData( a.invlog().getImgData() , 0 , 0 );
	drawHist( a );
})
$('#powerbtn').click( function(){
	var a = new CV(getImageData());
	var gamma = parseFloat( $('#gamma').val() );
	canvasContext.putImageData( a.power(gamma).getImgData() , 0 , 0 );
	drawHist( a );
})
$('#histeqbtn').click( function(){
	var a = new CV(getImageData());
	var trim = parseFloat( $('#trim').val() ) / 200 ;
	canvasContext.putImageData( a.histeq( trim ).getImgData() , 0 , 0 );
	drawHist( a );
})
$('#naiveadahisteqbtn').click( function(){
	var a = new CV(getImageData());
	var trim = parseFloat( $('#trim').val() ) / 200 ;
	var radius = parseFloat( $('#adaradius').val() ) ;
	canvasContext.putImageData( a.adahisteq( radius , trim ).getImgData() , 0 , 0 );
	drawHist( a );
})
$('#adahisteqbtn').click( function(){
	var a = new CV(getImageData());
	var trim = parseFloat( $('#trim').val() ) / 200 ;
	var radius = parseFloat( $('#adaradius').val() ) ;
	var grid = parseFloat( $('#adagrid').val() ) ;
	console.log( { radius : radius , grid : grid } )
	canvasContext.putImageData( a.adahisteq( radius , trim , grid ).getImgData() , 0 , 0 );
	drawHist( a );
})
$('#sobeledgebtn').click( function(){
	var T = new CV(getImageData());
	showCV( T.sobel() );
})
$('#sobelhog').click( function(){
	var T = new CV(getImageData());
	var result = T.sobel_hog();
	var tmp = [];
	for ( var i in result )
		tmp.push( [ (i*360) , result[i] ] );
	//sort for better display
	tmp.sort(function(a,b) { return a[0]-b[0]; } );
	//console.log( tmp );
	$.plot("#placeholder", [ { 
		bars: { show: true } ,
		data : tmp
		} ] );
		
	var xx = [];
	for ( var i in tmp )
		xx.push( tmp[i][1] );
	var sum = 0;
	for ( var i in tmp )
		sum += xx[i];
	for ( var i in tmp )
		xx[i] /= sum;
	
	window.open().document.write(JSON.stringify( xx ) );
	return tmp ;
	
})
