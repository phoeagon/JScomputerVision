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
brush.homothin = function( r ){
    var matrix = [];
    matrix[ (2*r+1)*(2*r+1)-1 ] = undefined;
    for (var i=0;i<2*r+1;++i)
        for ( var j = 0 ; j < 2*r+1; ++ j ){
			if ( i==r+1 || !j )
				matrix[ (2*r+1)*j + i ] = 1 ;
        }
    return {
            w : 2*r+1 ,
            h : 2*r+1 ,
            data : matrix
        }
}
//--------------------------------------------
brush.invert = function(){
	for ( var i = 0 ; i < this.data.length ; ++ i )
		mthis.data[i] ^= 1 ;
	return this ;
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
			buffer[ (br.h)*j+(br.w-i) ] = br.data[ (br.w)*i + j ];
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
