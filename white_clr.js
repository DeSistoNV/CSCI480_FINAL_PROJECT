var red = [1.0,0.0,0.0,1.0];
var blue = [0.0,0.0,1.0,1.0];
var green = [0.0,1.0,0.0,1.0];
C = [];
for(var p = 0;p < 6;p++){
	for(var j=0;j<909;j++) C.push(red);
	for(var j=0;j<909;j++) C.push(blue);
	for(var j=0;j<908;j++) C.push(green);
}

function randomRange(min, max) {
  return ~~(Math.random() * (max - min + 1)) + min
}


C = [];

for(var p = 0;p < 16356 ;p++){
	C.push([randomRange(0,1),randomRange(0,1),randomRange(0,1),1.0]);
}
