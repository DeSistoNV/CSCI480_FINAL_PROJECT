console.clear();


var gl;
var vPosition,vColor;
var xang, yang, zang, sx, cm;



var lightPosition = vec4(0.5, 0.5, 0.5, 1.0 );
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0 );
var lightDiffuse = vec4( 0.5, 0.5, 0.5, 1.0 );
var lightSpecular = vec4( 0.8, 0.8, 0.8, 1.0 );

var materialAmbient = vec4( .5, .5, .5, 1.0 );
var materialDiffuse = vec4( .6, .6, .6, 1.0 );
var materialSpecular = vec4(.5, .5, .5, 1.0 );
var materialShininess = 90.0;

var ambientColor, diffuseColor, specularColor;
var color, ambient, diffuse, specular;


var mesh = [];
var color = [];
var normals = [];
var color = new Array();
var xtransvar = 0;
var ytransvar = 0;
var ztransvar = 0;
var clicked = false;

var red = [1.0,0.0,0.0,1.0];
var blue = [0.0,0.0,1.0,1.0];
var green = [0.0,1.0,0.0,1.0];




function MouseWheelHandler(e) {

    // cross-browser wheel delta
    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    ztransvar += delta * 5;
    if(ztransvar > 100){
        ztransvar = 100;
    }
    if(ztransvar < -100){
        ztransvar = -100;
    }
    $('#translate').text("(" + Math.round(xtransvar*100)/100 +", " + Math.round(ytransvar*100)/100 + ", " + Math.round(ztransvar*100)/100+ ")");
    render();

}

const smooth_steps = 300; // controls speed of movement
var step_count = smooth_steps; // controller for movement iteration
// iniitalizing movement step arrays
var x_click = new Array(smooth_steps);
for (var i = 0; i <= smooth_steps; i++) x_click[i] = 0;
var y_click = new Array(smooth_steps);
for (var i = 0; i <= smooth_steps;i++) y_click[i] = 0;

function moveToClick(e){
    clicked = true;

  orig_x = xtransvar;
  orig_y = ytransvar;
// console.log('client : (' + e.clientX + ',' + e.clientY + ')');

  new_x = (-1 + 2 * e.clientX / 1000 ) ;
  new_y =  (-1 + 2 * (1000-e.clientY)/1000);
  // console.log('calced : (' + new_x + ',' + new_y + ')');
  $('#translate').text("(" + Math.round(xtransvar*100)/100 +", " + Math.round(ytransvar*100)/100 + ", " + Math.round(ztransvar*100)/100+ ")");

  dist_x =5* (new_x - orig_x);
  dist_y = 5*(new_y - orig_y);
  for(var i=0;i <= smooth_steps;i++){
    // formulas from pg 122
    x_click[i] = orig_x + dist_x * i / smooth_steps;
    y_click[i] = orig_y + dist_y * i / smooth_steps;
  }
  step_count = 0;

}

function config() {
    $("#rotx").on("input", function(){rotateX();});
    $("#roty").on("input", function(){rotateY();});
    $("#rotz").on("input", function(){rotateZ();});
    $("#scale").on("input", function(){scale(this.value);});
    $("#xtrans").on("input", function(){xtrans(this.value);});
    $("#ytrans").on("input", function(){ytrans(this.value);});
    $("#ztrans").on("input", function(){ztrans(this.value);});
    var canvas = document.getElementById( "gl-canvas" );
    canvas.onclick=function(event){
        moveToClick(event);

    };
    $('#rx').text("X rotation (" +0 + '\u00B0' + ")");
    $('#ry').text("Y rotation (" +0 + '\u00B0' + ")");
    $('#rz').text("Z rotation (" +0 + '\u00B0' + ")");
    $('#scalet').text("Scale (" + 0.01 + ")");
    $('#translate').text("(0,0,0)");


    // IE9, Chrome, Safari, Opera
    canvas.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false);

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.52,0.80, 0.89, 1);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // hidden surface remove pg 92
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth( 1.0 );
    gl.depthFunc( gl.LEQUAL );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    vColor = gl.getAttribLocation( program, "vColor" );
    vNormal = gl.getAttribLocation(program,"vNormal");
    // console.log(vColor);

    xang = gl.getUniformLocation( program, "xang" );
    yang = gl.getUniformLocation( program, "yang" );
    zang = gl.getUniformLocation( program, "zang" );
    sx = gl.getUniformLocation( program, "scale" );
    cm = gl.getUniformLocation( program, "cm" );


    ///////
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    ///////

    console.log( "V.length: " + V.length.toString() );
    console.log( "F.length: " + F.length.toString() );
    console.log( "C.length: " + C.length);
    if (F.length * 3 != C.length){
      console.log("color face mismatch");
      console.log("Should have "+ ( F.length * 3)  + " Colors")
    }
    for ( var i=0; i<F.length; i++ ) {
        // console.log(i);

        var v1 = V[ F[i][0]-1 ];
        var v2 = V[ F[i][1]-1 ];
        var v3 = V[ F[i][2]-1 ];
        // console.log(F[i]);
        for ( var j=0; j<v1.length; j++ ) mesh.push( v1[j] );
        for ( var jj=0; jj<v2.length; jj++ ) mesh.push( v2[jj] );
        for ( var jjj=0; jjj<v3.length; jjj++ ) mesh.push( v3[jjj] );

        var t1 = subtract(v2, v1);
        var t2 = subtract(v3, v1);
        for(var nn=0;nn<3;nn++) normals.push(vec3(normalize(cross(t1,t2))));

    }
    for(var i = 0;i < C.length;i++){
      var p = mult(vec4(C[i]),materialDiffuse);
      color.push(p);

    }
    bufferData();

    ///////
    gl.uniform1f( sx, 1 );
    gl.uniform4f( cm, CM[0], CM[1], CM[2], 0.0);
  ambientProduct = mult(lightAmbient, materialAmbient);
  /////
  gl.uniform4fv( gl.getUniformLocation( program, "ambientProduct"), flatten(ambientProduct) );
  gl.uniform4fv( gl.getUniformLocation( program, "diffuseProduct"), flatten(diffuseProduct) );
  gl.uniform4fv( gl.getUniformLocation( program, "specularProduct"), flatten(specularProduct) );
  gl.uniform4fv( gl.getUniformLocation( program, "lightPosition" ), flatten(lightPosition) );
  gl.uniform1f( gl.getUniformLocation( program, "shininess" ),materialShininess );
  ///////

   gl.uniform1f( sx, 0.01 );
	 shading = gl.getUniformLocation( program, "shading" );
   	gl.uniform1i( shading, true);
   render();
    // animate();

}

function animate() {

    timerID=setInterval( render,1);

}

function rotateX() {

    var select = document.getElementById('rotx');
    ang_deg = select.value;

    var radian =  ang_deg * (Math.PI/180.0);
    $('#rx').text("X rotation (" +ang_deg + '\u00B0' + ")");


    gl.uniform1f( xang, radian );

    render();

}


function rotateY() {

  var select = document.getElementById('roty');
  ang_deg = select.value;
    var radian =  ang_deg * (Math.PI/180.0);
    $('#ry').text("Y rotation (" +ang_deg + '\u00B0' + ")");


    gl.uniform1f( yang, radian );

    render();

}

function rotateZ() {
  var select = document.getElementById('rotz');
  ang_deg = select.value;
    var radian =  ang_deg * (Math.PI/180.0);
    $('#rz').text("Z rotation (" +ang_deg + '\u00B0' + ")");


    gl.uniform1f( zang, radian );

    render();

}

function scale(s_val) {

    $('#scalet').text("Scale (" +s_val+ ")");


    gl.uniform1f( sx, s_val );

    render();

}

function xtrans(s_val) {
    console.log('x trannslating');
    xtransvar = Number(s_val);
    clicked= false;
    var s = "(" + xtransvar +"," + ytransvar + "," + ztransvar+ ")";
    console.log(s);
    $('#translate').text(s);
    gl.uniform4f(cm, CM[0] - xtransvar, CM[1] - ytransvar,CM[2] + ztransvar,0.0);
    render();

}
function ytrans(s_val) {
  console.log('y trannslating');

    clicked= false;

  ytransvar=Number(s_val);
  $('#translate').text("(" + xtransvar +"," + ytransvar + "," + ztransvar+ ")");

gl.uniform4f(cm, CM[0]+xtransvar,CM[1] + ytransvar,CM[2] + ztransvar,0.0);

    render();

}
function ztrans(s_val) {

  ztransvar=Number(s_val);

  $('#translate').text("(" + xtransvar +"," + ytransvar + "," + ztransvar+ ")");
  console.log('z trannslating');

  gl.uniform4f(cm, CM[0] - xtransvar,CM[1] - ytransvar,CM[2] + ztransvar,0.0);

    render();

}



function bufferColor(){
  gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );

}


function bufferData() {


    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );


    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.bufferData( gl.ARRAY_BUFFER, flatten(mesh), gl.STATIC_DRAW );

    var colorId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorId);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );

    gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );

}

function render() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for ( var i=0; i<F.length*3; i+=3) {

      gl.drawArrays( gl.TRIANGLES, i, 3 );
}


    if (step_count++ < smooth_steps){
      gl.uniform4f( cm, CM[0] - x_click[step_count],CM[1] -y_click[step_count], CM[2] + ztransvar, 0.0 );
    }
    else{
        if(clicked){
    xtransvar = x_click[smooth_steps];
    ytransvar = y_click[smooth_steps];
}
    gl.uniform4f( cm, CM[0] - xtransvar, CM[1] - ytransvar, CM[2] + ztransvar, 0.0 );


  }

}
