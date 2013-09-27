// UI.js
//=====================================
//
//   by Qiu Zhe ( phoeagon_AT_gmail.com )
//
//  This file contains UI implementation for the CV project.
//

//
//------------------------------------------------------------
//
var imgParam = {
	width : 0 , 
	height : 0 
}
//
//------------------------------------------------------------
//
function loadImg(){
	function fitDimensions(){
		imgParam.width = $('#imgLoad')[0].width
		imgParam.height = $('#imgLoad')[0].height
		
		$('#myCanvas').attr('width' , imgParam.width );
		$('#myCanvas').attr('height' ,imgParam.height );
	}
	
	var c=canvas=$("#myCanvas")[0];
	var ctx=canvasContext=c.getContext("2d");
	var img=$("#imgLoad")[0];
	fitDimensions();

	ctx.drawImage(img,0,0);
}
//
//------------------------------------------------------------
//
function getImageData(){
	return canvasContext.
			getImageData( 0 , 0 , imgParam.width , imgParam.height );
}

$(window).load( loadImg ); 
// $(document).load doesn't work here as we have to wait till image itself is loaded
