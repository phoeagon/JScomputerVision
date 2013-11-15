// # brush.js
//  by Qiu Zhe ( phoeagon_AT_gmail.com )
//
// This file contains implementation of a brush generator
//
//---------------------------------
//
var brush = {};
//
//----------------------------------
//
brush.rect = function( w , h ){
    var matrix = [];
    matrix[ w * h - 1 ] = undefined;
    for ( i=0; i < w*h ; ++i )
        matrix[i] = 1;
    return {
        w : w ,
        h : h ,
        data : matrix
    }
}
//
//----------------------------------
//
brush.circle = function( r ){
    var matrix = [];
    matrix[ (2*r+1)*(2*r+1)-1 ] = undefined;
    for (var i=0;i<2*r+1;++i)
        for ( var j = 0 ; j < 2*r+1; ++ j ){
            var da = (i-r)*(i-r);
            var db = (j-r)*(j-r);
            if ( Math.round(Math.sqrt(da + db)) <= r )
                matrix[ (2*r+1)*j + i ] = 1;
            else matrix[ (2*r+1)*j + i ] = 0;
        }
    return {
            w : 2*r+1 ,
            h : 2*r+1 ,
            data : matrix
        }
}
//
//-----------------------------------------
//
brush.cross = function( r ){
    var matrix = [];
    matrix[ (2*r+1)*(2*r+1)-1 ] = undefined;
    for (var i=0;i<2*r+1;++i)
        for ( var j = 0 ; j < 2*r+1; ++ j ){
			if ( i==r+1 || j==r+1 )
				matrix[ (2*r+1)*j + i ] = 1 ;
			else
				matrix[ (2*r+1)*j + i ] = 0 ;
        }
    return {
            w : 2*r+1 ,
            h : 2*r+1 ,
            data : matrix
        }
}
//
//-----------------------------------------
//
brush.eye = function( r ){
    var matrix = [];
    matrix[ (2*r+1)*(2*r+1)-1 ] = undefined;
    for (var i=0;i<2*r+1;++i)
        matrix[i*(2*r+1)+i] = 1 ;
    return {
            w : 2*r+1 ,
            h : 2*r+1 ,
            data : matrix
        }
}
//
//-----------------------------------------
//
brush.sobelx = function(){
    var matrix = [];
    return {
            w : 3 ,
            h : 3 ,
            data : [
				-1.0,0.0,1.0, 
				-2.0,0.0,2.0, 
				-1.0,0.0,1.0
			]
        }
}
//
//-----------------------------------------
//
brush.sobely = function(){
    var matrix = [];
    return {
            w : 3 ,
            h : 3 ,
            data : [
				-1.0,-2.0,-1.0 , 
				0.0,0.0,0.0 , 
				1.0,2.0,1.0
			]
        }
}
//
//-----------------------------------------
//
brush.octagonalfg = function(){
    return {
            w : 3 ,
            h : 3 ,
            data : [ 
				0,1,0,
				1,1,0,
				0,0,0
			]
        }
}
brush.octagonalbg = function(){
    return {
            w : 3 ,
            h : 3 ,
            data : [ 
				0,0,0,
				0,0,1,
				0,1,1
			]
        }
}
//
//-----------------------------------------
//
brush.thinfg = function(){
    return {
            w : 3 ,
            h : 3 ,
            data : [ 
				0,0,0,
				0,1,0,
				1,1,1
			]
        }
}
brush.thinbg = function(){
    return {
            w : 3 ,
            h : 3 ,
            data : [ 
				1,1,1,
				0,0,0,
				0,0,0
			]
        }
}
//--------------------------------------------
brush.invert = function( br ){
	for ( var i = 0 ; i < br.data.length ; ++ i )
		br.data[i] ^= 1 ;
	return br ;
}
//-------------------------------------------
brush.eclipse = function( r ){
    //TODO
    return null;
}
//---------------------------------------------
brush.rot90 = function( br ){
	var a = br.w ; 
	var b = br.h ;
	var buffer = {};
	for ( var  i = 0 ; i < b ; ++ i )
		for ( var j = 0 ; j < a ; ++ j ) 
			buffer[ (br.h)*j+(br.w-i-1) ] = br.data[ (br.w)*i + j ];
	// copy back
	for ( var i in buffer )
		br.data[i] = buffer[i] ;
	return br;
}
//---------------------------------------------
// Todo: direct implementation
brush.rot180 = function( brush ){
	return brush.rot90( brush.rot90( brush ) ) ;
}
//---------------------------------------------
// Todo: direct routine implementation
brush.rot270 = function( brush ){
	return brush.rot90(brush.rot90( brush.rot90( brush ) ) );
}
