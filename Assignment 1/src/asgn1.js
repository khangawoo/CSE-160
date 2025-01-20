// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main(){
    gl_Position = a_Position;
    // gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main(){
    gl_FragColor = u_FragColor;
  }`

// Constants
const POINT = 0;
const TRIANGLE = 1; 
const CIRCLE = 3;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor; 
let u_Size;

function setUpwebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserverDrawingBuffer: true})
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
}

function connectVaraiblesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
}

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedShape = POINT;
let g_selectedSegment = 10;

function addActionsForHTMLUI(){
  // Buttons
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clear').onclick = function() { g_shapesList=[]; renderAllShapes()};
  document.getElementById('point').onclick = function() { g_selectedShape=POINT };
  document.getElementById('triangle').onclick = function() { g_selectedShape=TRIANGLE };
  document.getElementById('circle').onclick = function() { g_selectedShape=CIRCLE };
  document.getElementById('picture').onclick = function() { g_shapesList=[]; drawDuck();};
  document.getElementById('fill').onclick = function() { fillCanvasWithColor(g_selectedColor); };

  //Color Slider
  document.getElementById('redSlider').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlider').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlider').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;});

  // Size Slider
  document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_selectedSize = this.value;});
  document.getElementById('segmentSlider').addEventListener('mouseup', function() { g_selectedSegment = this.value;});

}

function fillCanvasWithColor(color) {
  gl.clearColor(color[0], color[1], color[2], color[3]);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function main() {
  // setup webgl
  setUpwebGL();
  //setup shaders and connects glsl variables
  connectVaraiblesToGLSL();

  // set up actions for html ui elements
  addActionsForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = []

function click(ev) {
  let [x, y] = convertCoordinatesEventsToGL(ev)
  let point;
  // Create and store new point
  if (g_selectedShape == POINT) {
    point = new Point();
  }else if (g_selectedShape == TRIANGLE)
  {
    point = new Triangle();
  }else {
    point = new Circle();
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  point.segments = g_selectedSegment;
  g_shapesList.push(point)

  renderAllShapes();
}

function convertCoordinatesEventsToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes(){
    // time of start of function
    var startTime = performance.now();
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
      g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    sendTextToHtml("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot")
}

function sendTextToHtml(text, htmlID)
{
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to find ID")
    return
  }
  htmlElm.innerHTML = text;
}

function drawDuck() {
  // Beak 
  var beak = new Float32Array([
    -0.55, 0.35, 0.0,
    -0.35, 0.40, 0.0,
    -0.35, 0.32, 0.0
  ]);

  // Head 
  var head1 = new Float32Array([
    -0.35, 0.32, 0.0,
    -0.35, 0.40, 0.0,
    -0.18, 0.46, 0.0
  ]);

  var head2 = new Float32Array([
    -0.35, 0.32, 0.0,
    -0.18, 0.46, 0.0,
    -0.15, 0.38, 0.0
  ]);

  var head3 = new Float32Array([
    -0.35, 0.32, 0.0,
    -0.18, 0.05, 0.0,
    -0.15, 0.38, 0.0
  ]);

  // Body 
  var body = new Float32Array([
    -0.18, 0.05, 0.0,
    -0.35, 0.32, 0.0,
    -0.45, -0.18, 0.0
  ]);

  var leg = new Float32Array([
    -0.18, 0.05, 0.0,
    -0.45, -0.18, 0.0,
    -0.12, -0.43, 0.0
  ]);

  var feet = new Float32Array([
    -0.12, -0.43, 0.0,
    -0.18, 0.05, 0.0,
    0.35, -0.02, 0.0
  ]);

  // Tail Vertices
  var tailVertices = new Float32Array([
    -0.12, -0.43, 0.0,
    0.65, -0.30, 0.0,
    0.35, -0.02, 0.0
  ]);

  var tailDetailVertices = new Float32Array([
    -0.09, -0.45, 0.0,
    -0.12, -0.62, 0.0,
    -0.06, -0.65, 0.0
  ]);

  var tailEndVertices = new Float32Array([
    -0.12, -0.62, 0.0,
    -0.06, -0.65, 0.0,
    -0.34, -0.63, 0.0
  ]);

  // Colors for each set of vertices
  var beakColor = [255/255, 260/255, 160/255, 1.0];
  var headColor = [0.60, 0.80, 0.60, 1.0];
  var bodyColor = [0.40, 0.60, 0.40, 1.0];
  var tailColor = [255/255, 260/255, 160/255, 1.0];



  drawBody(beak, beakColor);
  drawBody(head1, headColor);
  drawBody(head2, headColor);
  drawBody(head3, headColor);
  drawBody(body, bodyColor);
  drawBody(leg, bodyColor);
  drawBody(feet, bodyColor);
  drawBody(tailVertices, tailColor);
  drawBody(tailDetailVertices, tailColor);
  drawBody(tailEndVertices, tailColor);
}

function drawBody(vertices, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniform1f(u_Size, 20.0);

  var duckBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, duckBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}





