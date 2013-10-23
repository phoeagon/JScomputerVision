//
//	CV Lib
//============================
//		by Qiu Zhe ( phoeagon_AT_gmail.com )
//
//	This library is implemented as part of a course project for 
//  Computer Vision (2013 Fall).
//
// ## Quick Start
//
//      var canvas = $('#canvas')[0]; //get canvas
//      var context = canvas.getContext("2d"); // get canvas context
//      var imageCV = new CV( context.getImageData( 0 , 0 , 100 , 100 ) ); //new instance
//		context.putImageData( imageCV.grayscale().getImgData() , 0 , 0 );
//          // convert to gray scale, write back
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
// ## `CV` Constructor
//
// This constructor takes in the image data object as its parameter 
// and construct a corresponding `CV` object in which the image is stored.
//
// This routine returns the `CV` object constructed.
//
function CV ( imgData ){
	if ( imgData && imgData.cv_js ){ // if making a clone
		this.imgData = imgData.imgData;
		this.cv_js = true ; // marker
	}else{
		this.imgData = imgData;
		this.cv_js = true ; // marker
	}
}

//
//------------------------------------------------------------
//
// ## histogram
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
// ## getImgData  
// This method returns the image data
CV.prototype.getImgData = function (){
	return this.imgData;
}

//
//------------------------------------------------------------
//
// ##Grayscale
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
// ##Otsu's method
//
// [The Otsu method](http://en.wikipedia.org/wiki/Otsu's_method‎) is an 
//	algorithm to determine a threshold with which
// to threshold. This routine implements the one described in the wiki
// link above.
//
// This routine returns the threshold value returned by the Otsu method.
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
// ## thresholding
//
// This routine implements *thresholding* operation
// for images.
//
// It takes in three parameters. `thres` is the *threshold* to use.
// If `thres` is not specified, `otsu()` method is used to return
// an auto-generated value. `white` defines the output color
// of all pixels below *threshold* and should be given as
// an Array of three elements, such as `[255,255,255]`. `white` defaults
// to this white value when unspecified. `black` defines the output color
// of those above *threshold* and works pretty much like *white* in
// its syntax.
//
// This routine returns the `CV` object with processed data.
//
CV.prototype.threshold = function( thres , white , black ){
	if ( thres == null )
		thres = this.otsu();	//auto threshold
	if ( white == null || black == null ){
		white = colors.white ;
		black = colors.black ;
	}
	/* we assume that the image is already in grayscale here. */
	var i , j ,
		len = this.imgData.data.length , // the length of the imgData[]
		 imgData = this.imgData.data ; 
	for ( i = 0; i < len ; i += 4 ){
		var sum = 0; //sum of three channels on this pixel
		for ( j = 0 ; j < 3 ; ++ j )
			sum += imgData[i+j] ; //add R,G,B values
		sum = Math.round( sum / 3 ); //compute arithmetic average
		if ( sum > thres )
		{ /* set to white */
			for ( j = 0; j<3; ++j )
				imgData[ i+j ] = white[ j ] ;
		}else{
			/* set to black*/
			for ( j = 0 ; j < 3 ; ++j )
				imgData[ i+j ] = black[ j ] ;
		}
	}
	if ( CVoptions.debug ){ //debug outputs
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
// This routine impelements the 
// Dilation (<http://en.wikipedia.org/w/index.php?title=Dilation_(morphology)>).
//
// It takes in three parameters. `matrix` stands for the *structuring
// matrix* that is given in the following format:
//
//      {
//          h : 3 ,
//          w : 3 ,
//          data : [ 1,1,1 ,
//					 1,1,1,
//					 1,1,1 ]
//       }
//
// where as `[floor(w/2),floor(h/2)]` is assumed to be the origin of this matrix.
// `fit_color` defines the foreground color and is white `rgb(255,255,255)`
// by default if omitted. `iteration` is the number of iterations to take
// and has a default value of `1`
//
//
// This routine returns the `CV` object processed.
//
CV.prototype.dilate = function( matrix , fit_color , iteration ){
	if ( fit_color == null )
		fit_color = colors.white;
	if ( iteration == undefined || iteration < 1 )
		iteration = 1;
	var tmp=[]; // buffer array to hold processed result during the process
	var imgData = this.imgData.data; 
	var len = imgData.length; //length of the buffer. len=_number_of_pixels*4
	var i , j , k , l;	//loop variables
	var w = this.imgData.width , 
		h = this.imgData.height; //dimensions of the processed image
	var m_w = matrix.w ,
		m_h = matrix.h; //dimensions of the structuring matrix
	var bdw = Math.floor( m_w / 2 ),
		bdh = Math.floor( m_h / 2 ); //get offset of the origin ni the structuring matrix
	function GETSUB( l , r ){ //helper function: get subscription in the large image
		return l*w+r;
	}
	function GETMSUB( l , r ){ //helper function: get subscription in the structuring matrix
		return l*m_w + r;
	}
	;//console.log( matrix );
	while ( iteration -- > 0 ){ // iteration a number of times
		;//init tmp[] image
		for ( i = 0 ; i < len; ++i )
			tmp[i] = 0;		//init buffer array to black
		for ( i = bdh ; i < h-bdh ; ++i )
			for ( j = bdw ; j<w-bdw ; ++j ){//iterate through pixels on the processed image
				var cur_value = 0;//a placeholder to do bitwise operations				
				for ( k = 0; k < m_h ; ++k )
					for ( l = 0 ; l < m_w ; ++l ){//iterate through the matrix
						if ( matrix.data[ GETMSUB( k , l ) ] ){
							;//if pixel selected by brush
							var sub = GETSUB( i + k - bdh , j + l - bdw );
							var tmp_color = ( ( imgData[ sub * 4 ] +
										imgData[ sub*4 + 1 ]
										+ imgData[ sub * 4 + 2 ] ) / 3 );/* generate a tmp_color*/
							;// threshold single pixel
							cur_value = Math.max( cur_value ,
								( 255+tmp_color-fit_color[0]) /*&&
								  imgData[ sub * 4 + 1 ]==fit_color[1] &&
								  imgData[ sub * 4 + 2 ]==fit_color[2]*/
								 );
							;//console.log( [ imgData[ sub* 4 ] , fit_color[0] ] )
						}
					}
				var sub = GETSUB( i  , j  );//subscription of the larger (processed image)
				tmp[ sub*4 ] = cur_value ;//R
				tmp[ sub*4 + 1 ] = cur_value ;//G
				tmp[ sub*4 + 2 ] = cur_value ;//B
				tmp[ sub*4 + 3 ] = imgData[ sub*4 + 3 ];//A
				;//if ( imgData[ sub*4 ] !== tmp[ sub*4 ]  )
				;//	console.log("#");;
			}
		for ( i = 0 ; i < len ; ++ i )
			imgData[ i ] = tmp [ i ]; //copy back
	}
	return this;
}
//
//------------------------------------------------------------
//
// ## Erosion
//
// This routine impelements the 
// Erosion (<http://en.wikipedia.org/w/index.php?title=Erosion_(morphology)>).
//
// Parameters have the same meanings as in `dilate`.
//
// This routine returns the `CV` object.
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
	var w = this.imgData.width ,
		h = this.imgData.height;
	var m_w = matrix.w ,
		m_h = matrix.h;
	var bdw = Math.floor( m_w / 2 ),
	    bdh = Math.floor( m_h / 2 );
	function GETSUB( l , r ){
		return l*w+r;
	}
	function GETMSUB( l , r ){
		return l*m_w + r;
	}
	;//console.log( matrix );
	while ( iteration -- > 0 ){
		;//init tmp[] image
		for ( i = 0 ; i < len; ++i )
			tmp[i] = 0;
		for ( i = bdh ; i < h-bdh ; ++i )
			for ( j = bdw ; j<w-bdw ; ++j ){ //iterate through pixels on the processed image
				var cur_value = 255;//a placeholder to do bitwise operations				
				for ( k = 0; k < m_h ; ++k )
					for ( l = 0 ; l < m_w ; ++l ){ //iterate through the matrix
						if ( matrix.data[ GETMSUB( k , l ) ] ){
							;//if pixel selected by brush
							var sub = GETSUB( i + k - bdh , j + l - bdw );//get subscription
							var tmp_color = ( ( imgData[ sub * 4 ] +
											imgData[ sub*4 + 1 ]
											+ imgData[ sub * 4 + 2 ] )
											/ 3 ); 
							//console.log(  255+tmp_color-fit_color[0] );
							cur_value = Math.min( cur_value ,
								( 255+tmp_color-fit_color[0] ) /*&&
								  imgData[ sub * 4 + 1 ]==fit_color[1] &&
								  imgData[ sub * 4 + 2 ]==fit_color[2]*/
							 );
						;//console.log( [ imgData[ sub* 4 ] , fit_color[0] ] )
						}
					}
				var sub = GETSUB( i  , j  );	//subscription of the larger (processed image)
				tmp[ sub*4 ] = cur_value ;//R
				tmp[ sub*4 + 1 ] = cur_value;//G
				tmp[ sub*4 + 2 ] = cur_value;//B
				tmp[ sub*4 + 3 ] = imgData[ sub*4 + 3 ];//A
				;//if ( imgData[ sub*4 ] !== tmp[ sub*4 ]  )
				;//	console.log("#");;
			}
		for ( i = 0 ; i < len ; ++ i )
			imgData[ i ] = tmp [ i ]; //copy back 
	}
	return this;
}
//
//------------------------------------------------------------
//
// ## Open
//
// This routine impelements the Open.
//
// Parameters have the same meanings as in `dilate`.
//
// This routine returns the `CV` object.
//
CV.prototype.open = function( matrix , fit_color , iteration){
	return this.erode( matrix , fit_color , iteration )
				.dilate( matrix , fit_color , iteration );
}
//
//------------------------------------------------------------
//
// ## Close
//
// This routine impelements the Close.
//
// Parameters have the same meanings as in `dilate`.
//
// This routine returns the `CV` object.
//
CV.prototype.close = function( matrix , fit_color , iteration){
	return this.dilate( matrix , fit_color , iteration )
				.erode( matrix , fit_color , iteration );
}
//
//------------------------------------------------------------
//
// ## Close Tophat
//
// This routine impelements the Close Tophat.
//
// Parameters have the same meanings as in `dilate`.
//
// This routine returns the `CV` object.
//
CV.prototype.closeth = function( matrix , fit_color , iteration){
	var T = this.clone();
	return this.diff( T.close( matrix , fit_color , iteration ) );
}
//------------------------------------------------------------
//
// ## Open Tophat
//
// This routine impelements the Close Tophat.
//
// Parameters have the same meanings as in `dilate`.
//
// This routine returns the `CV` object.
//
CV.prototype.openth = function( matrix , fit_color , iteration){
	var T = this.clone();
	return this.diff( T.open( matrix , fit_color , iteration ) );
}
//
//------------------------------------------------------------
//
// ## Boundary
//
// This routine impelements the boundary.
//
// Parameters have the same meanings as in `dilate`,
// except for a lack of `iterations` parameter.
//
// This routine returns the `CV` object.
//
CV.prototype.boundary = function( matrix , fit_color ){
	if ( !matrix ) 
		var matrix = brush.rect(3,3);
	var T = this.clone( );
	return this.diff( T.erode( matrix , fit_color ) );
}
//
//------------------------------------------------------------
//
// ## Pixel-wise Operation
//
//
CV.prototype.pixwiseOp = function( obj , op ){
	if ( obj.cv_js ) //if another CV instance
		var imgD = obj.imgData ; 
	else 
		var imgD = obj ; //assume ImageData
	if ( imgD.width != this.imgData.width ||
		 imgD.height != this.imgData.height ){
		// TODO : auto scale
		alert("Dimensions not fit");
		console.log("Dimensions not fit");
		return this;
	}
	for ( var i in imgD.data ){
	if ( parseInt(i) % 4 != 3 )//skip alpha
		this.imgData.data[i] = op ( this.imgData.data[i] , 
								imgD.data[i] );
	}
	return this ;
}
//
//------------------------------------------------------------
//
// ## Map Operation
//
//
CV.prototype.map = function( op ){
	var dt = this.imgData.data ; 
	for ( var i = 0 ; i < this.imgData.data.length ; i += 4 ){
		var T = op([ dt[i] , dt[i+1] , dt[i+2] , dt[i+3] ]);//rgba
		dt[i] = T[0] ; 
		dt[i+1] = T[1] ; 
		dt[i+2] = T[2] ;
		dt[i+3] = T[3];
	}
	return this ;
}
//
//------------------------------------------------------------
//
// ## Union
//
//
CV.prototype.union = function( obj ){
	return this.pixwiseOp( obj , Math.max );
}
//
//------------------------------------------------------------
//
// ## Invert
//
//
CV.prototype.invert = function(){
	function inv( arr ){
		arr[0] = 255-arr[0];
		arr[1] = 255-arr[1];
		arr[2] = 255-arr[2] ;
		arr[3] ;  //skip alpha
		return arr;
	}
	return this.map( inv );
}
//
//------------------------------------------------------------
//
// ## Intersect
//
//
CV.prototype.intersect = function( obj ){
	return this.pixwiseOp( obj , Math.min );
}
//
//------------------------------------------------------------
//
// ## Diff
//
//
CV.prototype.diff = function( obj ){
	function minus( a , b ) { return a - b } 
	return this.pixwiseOp( obj , minus );
}
//
//------------------------------------------------------------
//
// ## Hit-or-miss
//
//
CV.prototype.hitormiss = function( b1 , b2 ){
	if ( b2== null )
		var b2 = b1; //fallback to classical pattern matching
	var T = this.clone( ) ;
	T.invert().erode( b2 ) ;
	return this.erode( b1 ).intersect( T );
}
//
//------------------------------------------------------------
//
CV.prototype.thin = function( b1 , b2 , c1 , c2 ){
	if ( b1 == null )
		var b1 = brush.thinfg();
	if ( b2==null )
		var b2 = brush.thinbg();
	if ( c1==null )
		var c1 = brush.octagonalfg();
	if ( c2==null )
		var c2 = brush.octagonalbg()
		//var b2 = brush.homobox( 1 )
	for ( var i = 0 ; i < 4 ; ++ i ){
		var T = this.clone( );
		this.diff( T.hitormiss( b1 , b2 ) );
		b1 = brush.rot90( b1 ) ;
		b2 = brush.rot90( b2 ) ;
		
		var T = this.clone( );
		this.diff( T.hitormiss( c1 , c2 ) );
		c1 = brush.rot90( c1 ) ;
		c2 = brush.rot90( c2 ) ;
	}
	return this ;
}
//
//------------------------------------------------------------
//
CV.prototype.thick = function( b1 , b2 , c1 , c2 ){
	if ( b1 == null )
		var b1 = brush.thinfg();
	if ( b2==null )
		var b2 = brush.thinbg();
	if ( c1==null )
		var c1 = brush.octagonalfg();
	if ( c2==null )
		var c2 = brush.octagonalbg()
		//var b2 = brush.homobox( 1 )
	for ( var i = 0 ; i < 4 ; ++ i ){
		var T = this.clone( );
		this.union( T.hitormiss( b1 , b2 ) );
		b1 = brush.rot90( b1 ) ;
		b2 = brush.rot90( b2 ) ;
		
		var T = this.clone( );
		this.union( T.hitormiss( c1 , c2 ) );
		c1 = brush.rot90( c1 ) ;
		c2 = brush.rot90( c2 ) ;
	}
	return this ;
}
//
//-------------------------------------------
//
CV.prototype.clone = function(){
	//if ( $ || jQuery ){ //we cannot directly deep copy a custom object even with JQ
		var dataCopy = new Uint8ClampedArray(this.imgData.data);
		var canvas = document.createElement('canvas');
		var T = canvas.getContext('2d').createImageData(this.imgData.width, this.imgData.height);
		T.data.set(dataCopy);
		return new CV({
				imgData : T ,
				cv_js   : true
			})
	//}return new CV( JSON.parse(JSON.stringify(this)) );
}
//
// ------------------------------------------------------------
//

CV.prototype.fromBrush = function ( br ){
	this.imgData = {} ;
	this.imgData.data = [];
	this.imgData.width = br.w ;
	this.imgData.height = br.h ;
	for ( var i in br.data ){
		var ii = parseInt( i );
		for ( var j = 0 ; j < 3; ++ j )//copy to all 3 channels
			this.imgData.data[ ii*4 + j ] = br.data[ ii ] ? 255 : 0;
		this.imgData.data[ ii*4+3 ] = 255 ; //alpha
	}
	
	return this ;
}
CV.prototype.toBrush = function(){
	var T = {
		w : this.imgData.width , 
		h : this.imgData.height ,
		data : []
	}
	for ( var i = 0 ; i < this.imgData.data.length ; i += 4){
		T.data[ i / 4 ] = ( ( this.imgData.data[i] + 
				this.imgData.data[i+1] + this.imgData.data[i+2] ) / 3 )
					> 127 ? 1 : 0 ;
	}
	return T ;
}
//
//------------------------------------
//
CV.prototype.log = function(){
	var k = 255 / Math.log( 256 ) ;
	this.map( function(pixel){
		for (i=0;i<3;++i)
			pixel[i] = Math.log(pixel[i] + 1) * k ;
		return pixel;
	})
	return this 
}
CV.prototype.invlog = function(){
	var k = Math.log( 256 ) / 255;
	this.map( function(pixel){
		for (i=0;i<3;++i)
			pixel[i] = Math.exp( pixel[i]*k ) - 1 ;
		return pixel;
	})
	return this 
}
CV.prototype.power = function( gamma ){
	var k = Math.exp( Math.log(255) * gamma ) / 255;
	this.map( function(pixel){
		for (i=0;i<3;++i)
			pixel[i] = Math.exp(Math.log(pixel[i])*gamma) / k;
		return pixel;
	})
	return this 
}
CV.prototype.histeq = function( trim ){
	if ( trim == null )
		trim = 0;
	var hist = this.histogram( true ) , min = 0 , max = 255;
	var accu = 0 ;
	while( (accu+=hist[min])<=trim && min < 255) 
		min++;
	accu = 0 ;
	while( (accu += hist[max])<=trim && max ) 
		max -- ;
	if ( min )
		min -- ; 
	if ( max!== 255 )
		max ++ ;
	//console.log( [ min , max ] );
	if ( min - max == 0 ){ min = 127 ; max = 128 };
	var k = 255 / ( max - min ) 
	this.map( function(pixel){
		for (i=0;i<3;++i){
			pixel[i] = Math.max( 0 , pixel[i] - min) * k ;
			pixel[i] = Math.min( pixel[i] , 255 ) ;
		}
		return pixel;
	})
	return this ;
}
//
//-----------------------------------------
//
// ## 
// If `record` is provided, this routine writes range info to `record`.
// Otherwise it does a *naive* AHE and write back to `this`
//
CV.prototype.adahisteq_helper = function( radius , trim , record , grid ) {
	var debug = [] ;
	if ( trim == null )
		trim = 0;
	if ( grid == null )
		grid = 1 ;
	var imgData = this.imgData.data ;
	var len = imgData.length;
	var i , j , k , l , x , y ;
	var w = this.imgData.width ,
		h = this.imgData.height;
	function GETSUB( l , r ){
		return l*w+r;
	}
	var clo = this.clone();
	
	function stat( hist , sum , i , j , clo ){
		if ( (i != h-1 && i % grid) || (j != w-1 && j%grid) )
			return ;
		var min = 0 , max = 255 , accum = 0 , crit = sum * trim   ;
		while ( (accum += hist[min] ) <= crit && min <= 255 )
			++min ;
		accum = 0 ;
		while ( ( accum += hist[max] ) <= crit && max>0)
			-- max ;
		if ( min ) --min ; 
		if ( max != 255 )++ max ;
		k = 255 / ( max - min ) ;
		debug.push( [min , max ] );
		var sub = GETSUB( i , j ) ;
		function conv( val ){
			return Math.min( 255 , Math.round(Math.max( 0 ,  val - min ) * k)  );
		}
		// process RGB ignore A
		if ( record != null )
			record[ sub ] = {min: min , max : max};
		else { // if no provided, write back
			imgData[ sub * 4 + 0 ] = conv( imgData[ sub * 4 + 0 ] )
			imgData[ sub * 4 + 1 ] = conv( imgData[ sub * 4 + 1 ] )
			imgData[ sub * 4 + 2 ] = conv( imgData[ sub * 4 + 2 ] )
		}
	}
	
	for ( i = 0 ; i <= h ; ++ i ){
		//console.log("Row: "+i );
		var tworadius = Math.min(radius,i)+Math.min(radius,h-i)  ; //used to be 2*radius
		;// init hist[] array
		var hist = {};
		for ( j = 0 ; j < 256 ; ++j ) 
			hist[j] = 0 ;
		// calc context for first pixel ( except for the first )
		for ( y = 0 ; y < 2*radius ; ++ y ){
			for ( x = 0 ; x < tworadius + 1 ; ++ x ){
				var sub = GETSUB( i - radius + x , y );
				for ( k = 0 ; k < 3 ; ++ k ) // calc RGB ignore A
					hist[ clo.imgData.data[ k + sub*4 ] ]++ ;
			}
			var cnt = 0;
			for ( v = 0 ; v < 256 ; ++ v )
				cnt += hist[v] ;
			if ( y >= radius )
				stat( hist , cnt , i , y-radius , clo );
		}
		var sum = (tworadius + 1)*(tworadius+1)*3 ; //3 channels
		for ( j = radius ; j <= w - radius ; ++ j ){
			// for each pixel add the first column
			for ( x = 0 ; x < tworadius + 1 ; ++ x ){
				var sub = GETSUB( i - radius + x , j + radius ) ;
				for ( k = 0 ; k < 3 ; ++ k ) // calc RGB ignore A
					hist[ clo.imgData.data[ k + sub*4 ] ] ++ ;
			}
			// do statistics
			stat( hist , sum , i , j , clo );
			// remove last column
			for ( x = 0 ; x < tworadius + 1 ; ++ x ){
				var sub = GETSUB( i - radius + x , j - radius ) ;
				for ( k = 0 ; k < 3 ; ++ k ) // calc RGB ignore A
					hist[ clo.imgData.data[ k + sub*4 ] ] -- ;
			}
		}
		for ( y = 0 ; y < radius*2 ; ++ y ){
			var cnt = 0 ; 
			for ( v = 0 ; v < 256 ; ++ v )
				cnt += hist[v] ;
			if ( y <= radius )
				stat( hist , cnt , i , w+y-radius+1 , clo );
			for ( x = 0 ; x < tworadius + 1 ; ++ x ){
				var sub = GETSUB( i - radius + x , w-2*radius+y );
				for ( k = 0 ; k < 3 ; ++ k ) // calc RGB ignore A
					hist[ clo.imgData.data[ k + sub*4 ] ]-- ;
			}
		}
	}
	//console.log( debug );
	return this ;
}
CV.prototype.adahisteq = function( radius , trim , grid ) {
	if ( grid == null || grid == 0  )
		return this.adahisteq_helper( radius , trim );//write back
	else{
		var info = {};
		this.adahisteq_helper( radius , trim , info , grid ); // write range info to info
		var imgData = this.imgData.data ;
		var len = imgData.length;
		var i , j , k , l , x , y ;
		var w = this.imgData.width ,
			h = this.imgData.height;
		for ( i = 0 ; i <= h ; ++ i ) 
			for ( j = 0 ; j <= w ; ++j ){
				var gridlx = Math.floor(i / grid) * grid ;
				var gridhx = Math.ceil(i / grid) * grid ;					
				var gridly = Math.floor(j / grid ) * grid ;
				var gridhy = Math.ceil(j / grid) * grid ;	
				if ( gridhx >= h ) gridhx = h-1 ;
				if ( gridhy >= w ) gridhy = w-1 ;
				
				function conv( val , range ){
					var k = 255 / ( range.max - range.min ) ;
					return Math.min( 255 , 
						Math.round(
							Math.max( 0 ,  val - range.min )
								* k)
						);
				}
				function GETSUB( l , r ){
					return l*w+r;
				}
				var sub = GETSUB( i , j ) ;
				var coeff = 1; 
				if ( gridly==gridhy )
					coeff /= grid ;
				else coeff /= (gridhy-gridly );
				if ( gridhx == gridlx )
					coeff /= grid ;
				else coeff /= ( gridhx - gridlx );
				//assume grayscale
				var original_value = imgData[ sub*4  ] ;
				if ( info[ GETSUB(gridhx,gridhy) ] == null ){
					console.log( "fuck" )
				}
				// nasty fix when gridlx==gridly==i
				var v1 = conv( original_value , info[ GETSUB(gridlx,gridly) ] );
				var v2 = conv( original_value , info[ GETSUB(gridlx,gridhy) ] );
				var v3 = conv( original_value , info[ GETSUB(gridhx,gridly) ] );
				var v4 = conv( original_value , info[ GETSUB(gridhx,gridhy) ] );
				if ( gridlx == gridhx ){ gridhx += grid/2; gridlx -= grid/2 ;}
				if ( gridly == gridhy ){ gridhy += grid/2; gridly -= grid/2 ;}
				var finalv = ( 	v4*(i-gridlx)*(j-gridly) + 
								v3*(i-gridlx)*(gridhy-j) +
								v2*(gridhx-i)*(j-gridly)+
								v1*(gridhx-i)*(gridhy-j)
							) * coeff ;
				finalv = Math.round( finalv );
				if ( finalv < 0 ) finalv = 0 ;
				if ( finalv > 255 ) finalv = 255 ;
				for ( var k = 0 ; k < 3 ; ++ k ){
					this.imgData.data[ sub*4 + k ] = finalv ;
				}
			}
		return this ;
	}
}
