//
//	CV Lib
//============================
//		by Qiu Zhe ( phoeagon_AT_gmail.com )
//
//	This library is implemented as part of a course project for 
//  Computer Vision (2013 Fall).
//
//-----------------------------
//

// The `CV` object
//----------------
// The main CV object that stores all sorts of methods
CV = {
};

// ## `CV` Object Constructor
//
// This constructor takes in the image data object as its parameter 
// and construct a corresponding `CV` object in which the image is stored.
//
function CV ( imgData ){
	this.imgData = imgData;
}

// ##`cv.histagram` - Histagram
// 
// Generate histagram information of a grayscale image.
//
CV.prototype.histogram = function( ){
	var hist = [];
	var i;//placeholder
	for ( i=0; i<256; ++i )
		hist[i] = 0;
	
}

// ## `getImgData`  
// This method returns the image data
CV.prototype.getImgData = function (){
	return this.imgData;
}

// ##`grayscale`
//
// Convert the image stored in the current `CV` object to become grayscale.
//
// The parameter `weight` passed in can either be `NULL` (indicating a default
// arithmetic operation) or instead an `Array` like `[1/3,1/6,1/2]`, whose
// three elements should sum to zero (otherwise a default *even-weight* 
// strategy is used as fallback
//
CV.prototype.grayscale = function ( weight ){
	try{ /* put into try catch just in case some typeError occurs LOL*/
		if ( weight === null ||
			weight.length<3 ||
			weight[0]+weight[1]+weight[2]!=1 )
				{
					weight = [ 1/3 , 1/3 , 1/3 ];
				}
	}catch(e){
		weight = [ 1/3 , 1/3 , 1/3 ]
	}
	var i , j ;
	var len = this.imgData.length();
	for ( i = 0 ; i < len ; i += 4 ){
		var sum = 0;
		for ( j = 0 ; j < 3 ; ++ j )
			sum += imgData [j] * weight[j]
		/* imgData[i+3] is the alpha channel */
		sum = Math.round(sum);
		for ( j = 0 ; j < 3 ; ++ j )
			imgData[j] = sum ;
	}
}

// ##`otsu`
//
// [The Otsu method](http://en.wikipedia.org/wiki/Otsu's_method‎) is an 
//	algorithm to determine a threshold with which
// to threshold.
//
CV.prototype.otsu = function( ){
}
