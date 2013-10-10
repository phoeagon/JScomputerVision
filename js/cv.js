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
							var tmp_color = ( ( imgData[ sub * 4 ] +
										imgData[ sub*4 + 1 ]
										+ imgData[ sub * 4 + 2 ] ) / 3 )
									 > 128 ? 255 : 0;/* generate a tmp_color, dirty fix
									for the case when the input is not a thresholded image*/
							;// threshold single pixel
							var sub = GETSUB( i + k - bdh , j + l - bdw );
							cur_value = cur_value ||
								( tmp_color==fit_color[0] /*&&
								  imgData[ sub * 4 + 1 ]==fit_color[1] &&
								  imgData[ sub * 4 + 2 ]==fit_color[2]*/
								 );
							;//console.log( [ imgData[ sub* 4 ] , fit_color[0] ] )
						}
					}
				var sub = GETSUB( i  , j  );//subscription of the larger (processed image)
				tmp[ sub*4 ] = cur_value ? 255 : 0 ;//R
				tmp[ sub*4 + 1 ] = cur_value ? 255 : 0 ;//G
				tmp[ sub*4 + 2 ] = cur_value ? 255 : 0 ;//B
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
				var cur_value = 1;//a placeholder to do bitwise operations				
				for ( k = 0; k < m_h ; ++k )
					for ( l = 0 ; l < m_w ; ++l ){ //iterate through the matrix
						if ( matrix.data[ GETMSUB( k , l ) ] ){
							;//if pixel selected by brush
							var tmp_color = ( ( imgData[ sub * 4 ] +
											imgData[ sub*4 + 1 ]
											+ imgData[ sub * 4 + 2 ] )
											/ 3 )
										> 128 ? 255 : 0; /* generate a tmp_color, dirty fix
									for the case when the input is not a thresholded image*/
							;// threshold single pixel
							var sub = GETSUB( i + k - bdh , j + l - bdw );//get subscription
							cur_value = cur_value &&
								( tmp_color==fit_color[0] /*&&
								  imgData[ sub * 4 + 1 ]==fit_color[1] &&
								  imgData[ sub * 4 + 2 ]==fit_color[2]*/
							 );
						;//console.log( [ imgData[ sub* 4 ] , fit_color[0] ] )
						}
					}
				var sub = GETSUB( i  , j  );	//subscription of the larger (processed image)
				tmp[ sub*4 ] = cur_value ? 255 : 0 ;//R
				tmp[ sub*4 + 1 ] = cur_value ? 255 : 0 ;//G
				tmp[ sub*4 + 2 ] = cur_value ? 255 : 0 ;//B
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
		var imgData = obj.imgData ; 
	else 
		var imgData = obj ; //assume ImageData
	if ( imgData.width != this.imgData.width ||
		 imgData.height != this.imgData.height ){
		// TODO : auto scale
		alert("Dimensions not fit");
		console.log("Dimensions not fit");
		return this;
	}
	for ( var i in imgData.data )
	if ( parseInt(i) % 4 != 3 )//skip alpha
		this.imgData.data[i] = op ( this.imgData.data[i] , 
								imgData.data[i] );
	return this ;
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
	for ( var i in imgData.data )
	if ( parseInt(i) % 4 != 3 )//skip alpha
		this.imgData.data[i] = op ( this.imgData.data[i] , 
								imgD.data[i] );
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
		arr[0] = -arr[0];
		arr[1] = -arr[1];
		arr[2] = -arr[2] ;
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
	var T = this.clone( ) ;
	if ( b2==null )
		b2 = brush.neg( b1 ); 
	T.invert().erode( b2 ) ;
	this.erode( b1 );
	return this.intersect( T );
}
//
//------------------------------------------------------------
//
CV.prototype.thin = function(){
	var b = brush.rect(3,3) ;
	for ( var i = 0 ; i < 4 ; ++ i ){
		var T = this.clone( );
		//this.diff( T.hitormiss( b1 , ) );
		b.rot90() ;
	}
}

CV.prototype.clone = function(){
	return new CV( this );
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
