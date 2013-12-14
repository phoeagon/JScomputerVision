CV.prototype.calculate_jacobian_homography = function( src1 , src2 , jacobian , map_matrix )
{
    var w00=map_matrix[0][0];
    var w01=map_matrix[0][1];
    var w02=map_matrix[0][2];
    var w10=map_matrix[1][0];
    var w11=map_matrix[1][1];
    var w12=map_matrix[1][2];
    var w20=map_matrix[2][0];
    var w21=map_matrix[2][1];
    var w22=map_matrix[2][2];

    
	var imgData = this.imgData.data ;
	var len = imgData.length;
	var w = this.imgData.width ,
		h = this.imgData.height;

    var i,j,k,a,b,c,y,x;
    for (y=0;y<h;++y)
        for(x=0;x<w;++x)
        {
            var den = 1/(w20*x+w21*y+1)
            var u = -(w00*x+w01*y+w02)*den;
            var v = -(w10*x+w11*y+w12)*den;
            var x_s = x*den ;
            var y_s = y*den ;

            var sub = y*w + x ;
            
            //for (a=0;a<3;++a){//channel
                var src1_pix = src1[sub*4+a];
                var src2_pix = src2[sub*4+a];

                jacobian[ y*w+x , 0 ] = x_s*src1_pix;
                jacobian[ y*w+x , 1 ] = x_s*src2_pix
                jacobian[ y*w+x , 2 ] = u*x_s*src1_pix + v*x_s*src2_pix
                jacobian[ y*w+x , 3 ] = y_s*src1_pix
                jacobian[ y*w+x , 4 ] = y_s*src2_pix
                jacobian[ y*w+x , 5 ] = u*y_s*src1_pix + v*y_s*src2_pix
                jacobian[ y*w+x , 6 ] = den*src1_pix
                jacobian[ y*w+x , 7 ] = den*src2_pix
            //}
        }
}
