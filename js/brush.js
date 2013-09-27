// # brush.js
//  by Qiu Zhe ( phoeagon_AT_gmail.com )
//
// This file contains implementation of a brush generator
//
//---------------------------------
//
var brushGenerator = {};
//
//----------------------------------
//
brushGenerator.generateRect = function( w , h ){
    var matrix = [];
    matrix[ w * h ] = undefined;
    for ( var i in matrix )
        matrix[i] = 1;
    return {
        w : w ,
        h : h ,
        matrix : matrix
    }
}
//
//----------------------------------
//
brushGenerator.generateCircle = function( r ){
    var matrix = [];
    matrix[ r*r ] = undefined;
    for (var i=0;i<2*r;++i)
        for ( var j = 0 ; j < 2*r; ++ j ){
            var da = (i-r)*(i-r);
            var db = (j-r)*(j-r);
            if ( da + db <= r )
                matrix[ 2*r*j + i ] = 1;
            else matrix[ 2*r*j + i ] = 0;
        }
    return {
            w : 2*r ,
            h : 2*r ,
            matrix : matrix
        }
}
//
//-----------------------------------------
//
brushGenerator.generateEclipse = function( r ){
    //TODO
    return null;
}
