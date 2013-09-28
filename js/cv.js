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

// ## Global Color Object
//
colors = {
	white : [255 , 255 , 255 ] ,
	black : [ 0 , 0 ,  0 ] 
};

//
//------------------------------------------------------------
//
// ##The object storing global configurations
//
CVoptions = {
	debug : false /* whether or not dump extra info to console*/
}

//
//------------------------------------------------------------
//
// ## `CV` Object Constructor
//
// This constructor takes in the image data object as its parameter 
// and construct a corresponding `CV` object in which the image is stored.
//
// This routine returns the `CV` object constructed.
//
function CV ( imgData ){
	this.imgData = imgData;
}

//
//------------------------------------------------------------
//
// ##`cv.histogram` - histogram
// 
// Generate histogram information of a grayscale image.
//
// This routine takes in one parameter, `normalize`. If `normalize`
// can be converted to `true`, normalization is conducted before returning
// result. Default value is `false`
//
// This routine returns the histogram as an `Array`
//
CV.prototype.histogram = function( normalize ){
	var hist = [] , len = this.imgData.data.length ;
	var imgData = this.imgData.data;
	var i;/*placeholder*/
	for ( i=0; i<256; ++i )
		hist[i] = 0;
	for ( i=0; i < len; ++i ){
		if ( i % 4 != 3 ){// skip the alpha channel
			hist[ imgData[i] ]++;
		}
	}
	if ( normalize ){
		var sum = 0;
		for ( i = 0 ; i < 256 ; ++i )
			sum += hist[i];
		for ( i = 0 ; i < 256 ; ++ i )
			hist[i] /= sum;
	}
	if ( CVoptions.debug ){
		console.log( "histogram" );
		console.log( hist );
	}
	return hist;
}

//
//------------------------------------------------------------
//
// ## `getImgData`  
// This method returns the image data
CV.prototype.getImgData = function (){
	return this.imgData;
}

//
//------------------------------------------------------------
//
// ##`grayscale`
//
// Convert the image stored in the current `CV` object to become grayscale.
//
// The parameter `weight` passed in can either be `NULL` (indicating a default
// arithmetic operation) or instead an `Array` like `[1/3,1/6,1/2]`, whose
// three elements should sum to zero (otherwise a default *even-weight* 
// strategy is used as fallback
//
// This routine returns the `CV` object with modified image data
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
	var len = this.imgData.data.length;
	var imgData = this.imgData.data;
	for ( i = 0 ; i < len ; i += 4 ){
		var sum = 0;
		for ( j = 0 ; j < 3 ; ++ j )
			sum += imgData [i+j] * weight[j]
		/* imgData[i+3] is the alpha channel */
		sum = Math.round(sum);
		for ( j = 0 ; j < 3 ; ++ j )
			imgData[ i+j ] = sum ;
	}
	if ( CVoptions.debug ){
		console.log( "grayscale" );
		console.log( weight );
		console.log( this.imgData );
	}
	return this;
}

//
//------------------------------------------------------------
//
// ##`otsu`
//
// [The Otsu method](http://en.wikipedia.org/wiki/Otsu's_method‎) is an 
//	algorithm to determine a threshold with which
// to threshold. This routine implements the one described in the wiki
// link above.
//
// This routine returns the threshold value
//
CV.prototype.otsu = function( ){
	var hist = this.histogram(0);//no normalization
	var imgData = this.imgData.data , 
		len = imgData.length ;
	var i , j ;
	var pixCnt = len / 4 * 3; //omit alpha channel
	var sum = 0 , sumb=0 , cntb=0 , cntf=0 ;
	for ( i = 0 ; i < 256; ++ i )
		sum += i * hist[i];
	var curMax = -1 ;
	var thres = 0;
	for ( i = 0 ; i < 256; ++i ){
		cntb += hist[i] ;	//add the number of pixels of current gray level to front
		cntf = pixCnt - cntb ;
		if ( cntb == 0 ) continue;
		if ( cntf == 0 ) break;
		
		sumb += i * hist[i];
		
		var meanf = ( sum - sumb ) / cntf ; //mean foreground
		var meanb = sumb / cntb;	//mean background
		
		var diff = cntb*cntf*(meanb-meanf)*(meanb-meanf);
		if ( diff > curMax ) {
			curMax = diff ;
			thres = i ;
		}
	}
	return thres;
}

//
//------------------------------------------------------------
//
// ## `thresholding`
//
// This routine 
//
CV.prototype.threshold = function( thres , white , black ){
	if ( thres == null )
		thres = this.otsu();	//auto threshold
	if ( white == null || black == null ){
		white = colors.white ;
		black = colors.black ;
	}
	/* we assume that the image is already in grayscale here. */
	var i , j ,  len = this.imgData.data.length , imgData = this.imgData.data ;
	for ( i = 0; i < len ; i += 4 ){
		var sum = 0;
		for ( j = 0 ; j < 3 ; ++ j )
			sum += imgData[i+j] ; 
		sum = Math.round( sum / 3 );
		if ( sum >= thres )
		{ /* set to white */
			for ( j = 0; j<3; ++j )
				imgData[ i+j ] = white[ j ] ;
		}else{
			/* set to black*/
			for ( j = 0 ; j < 3 ; ++j )
				imgData[ i+j ] = black[ j ] ;
		}
	}
	if ( CVoptions.debug ){
		console.log( "threshold" );
		console.log( this.imgData );
	}
	return this;
}
//
//------------------------------------------------------------
//
// ## Dilation
//
//
CV.prototype.dilate = function( matrix , fit_color , iteration ){
	if ( fit_color == null )
		fit_color = colors.white;
	if ( iteration == undefined || iteration < 1 )
		iteration = 1;
	var tmp=[];
	var imgData = this.imgData.data;
	var len = imgData.length;
	var i , j , k , l;
	var w = this.imgData.width , h = this.imgData.height;
	var m_w = matrix.w , m_h = matrix.h;
	var bdw = Math.floor( m_w / 2 );
	var bdh = Math.floor( m_h / 2 );
	function GETSUB( l , r ){
		return l*w+r;
	}
	function GETMSUB( l , r ){
		return l*m_w + r;
	}
	console.log( matrix );
	while ( iteration -- > 0 ){
		;//init tmp[] image
		for ( i = 0 ; i < len; ++i )
			tmp[i] = 0;
		for ( i = bdh ; i < h-bdh ; ++i )
			for ( j = bdw ; j<w-bdw ; ++j ){
				var cur_value = 0;
				
				for ( k = 0; k < m_h ; ++k )
					for ( l = 0 ; l < m_w ; ++l ){
						if ( matrix.data[ GETMSUB( k , l ) ] ){
							;//if pixel selected by brush
							var tmp_color = ( ( imgData[ sub * 4 ] + imgData[ sub*4 + 1 ]
											+ imgData[ sub * 4 + 2 ] ) / 3 ) > 128 ? 255 : 0;
							;// threshold single pixel
							var sub = GETSUB( i + k - bdh , j + l - bdw );
							cur_value = cur_value ||
								( tmp_color==fit_color[0] /*&&
								  imgData[ sub * 4 + 1 ]==fit_color[1] &&
								  imgData[ sub * 4 + 2 ]==fit_color[2]*/ );
							;//console.log( [ imgData[ sub* 4 ] , fit_color[0] ] )
						}
					}
				var sub = GETSUB( i  , j  );
				tmp[ sub*4 ] = cur_value ? 255 : 0 ;//R
				tmp[ sub*4 + 1 ] = cur_value ? 255 : 0 ;//G
				tmp[ sub*4 + 2 ] = cur_value ? 255 : 0 ;//B
				tmp[ sub*4 + 3 ] = imgData[ sub*4 + 3 ];//A
				;//if ( imgData[ sub*4 ] !== tmp[ sub*4 ]  )
				;//	console.log("#");;
			}
		for ( i = 0 ; i < len ; ++ i )
			imgData[ i ] = tmp [ i ];
	}
	return this;
}
//
//------------------------------------------------------------
//
// ## Erosion
//
//
CV.prototype.erode = function( matrix , fit_color , iteration){
	if ( fit_color == null )
		fit_color = colors.white;
	if ( iteration == undefined || iteration < 1 )
		iteration = 1;
	var tmp=[];
	var imgData = this.imgData.data;
	var len = imgData.length;
	var i , j , k , l;
	var w = this.imgData.width , h = this.imgData.height;
	var m_w = matrix.w , m_h = matrix.h;
	var bdw = Math.floor( m_w / 2 );
	var bdh = Math.floor( m_h / 2 );
	function GETSUB( l , r ){
		return l*w+r;
	}
	function GETMSUB( l , r ){
		return l*m_w + r;
	}
	console.log( matrix );
	while ( iteration -- > 0 ){
		;//init tmp[] image
		for ( i = 0 ; i < len; ++i )
			tmp[i] = 0;
		for ( i = bdh ; i < h-bdh ; ++i )
			for ( j = bdw ; j<w-bdw ; ++j ){
				var cur_value = 1;
				
				for ( k = 0; k < m_h ; ++k )
					for ( l = 0 ; l < m_w ; ++l ){
						if ( matrix.data[ GETMSUB( k , l ) ] ){
							;//if pixel selected by brush
							var tmp_color = ( ( imgData[ sub * 4 ] + imgData[ sub*4 + 1 ]
											+ imgData[ sub * 4 + 2 ] ) / 3 ) > 128 ? 255 : 0;
							;// threshold single pixel
							var sub = GETSUB( i + k - bdh , j + l - bdw );
							cur_value = cur_value &&
								( tmp_color==fit_color[0] /*&&
								  imgData[ sub * 4 + 1 ]==fit_color[1] &&
								  imgData[ sub * 4 + 2 ]==fit_color[2]*/ );
							;//console.log( [ imgData[ sub* 4 ] , fit_color[0] ] )
						}
					}
				var sub = GETSUB( i  , j  );
				tmp[ sub*4 ] = cur_value ? 255 : 0 ;//R
				tmp[ sub*4 + 1 ] = cur_value ? 255 : 0 ;//G
				tmp[ sub*4 + 2 ] = cur_value ? 255 : 0 ;//B
				tmp[ sub*4 + 3 ] = imgData[ sub*4 + 3 ];//A
				;//if ( imgData[ sub*4 ] !== tmp[ sub*4 ]  )
				;//	console.log("#");;
			}
		for ( i = 0 ; i < len ; ++ i )
			imgData[ i ] = tmp [ i ];
	}
	return this;
}
