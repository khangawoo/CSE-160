// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main(){
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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

function setUpwebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserverDrawingBuffer: true})
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    gl.enable(gl.DEPTH_TEST);
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
  // Get storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix= gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalAngle;
let g_leftArmAngle;
let g_leftElbowAngle;
let g_rightArmAngle;
let g_rightElbowAngle;
let g_headAngle;
let g_animation;

function addActionsForHTMLUI(){
  // Angle Slider
  document.getElementById('angleSlider').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes();});

  // Joint Slider
  document.getElementById('leftArmSlider').addEventListener('mousemove', function() { g_leftArmAngle = -this.value; renderAllShapes();});
  document.getElementById('leftElbowSlider').addEventListener('mousemove', function() { g_leftElbowAngle = this.value; renderAllShapes();});

  document.getElementById('rightArmSlider').addEventListener('mousemove', function() { g_rightArmAngle = this.value; renderAllShapes();});
  document.getElementById('rightElbowSlider').addEventListener('mousemove', function() { g_rightElbowAngle = this.value; renderAllShapes();});

  document.getElementById('headSlider').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes();});

  // Animation Button
  document.getElementById('animationOn').onclick = function() {g_animation=true;}
  document.getElementById('animationOff').onclick = function() {g_animation=false;}

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
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);
}

// var g_shapesList = []

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

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime

  updateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    let time = g_seconds;

    // Left Arm: Oscillates between -45 and 45 degrees
    g_leftArmAngle = 30 * Math.sin(time);

    // Left Elbow: Moves slightly in sync with the arm
    g_leftElbowAngle = 20 * Math.sin(time * 1.5);

    // Right Arm: Moves opposite to the left arm for balance
    g_rightArmAngle = 30 * Math.sin(time + Math.PI);

    // Right Elbow: Slightly exaggerated movement
    g_rightElbowAngle = 25 * Math.sin(time * 1.3);

    // Head: Small oscillation to simulate subtle head movement
    g_headAngle = 10 * Math.sin(time * 0.5);
  }
}

function renderAllShapes(){
    // time of start of function
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0,1,0)
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT )
var body = new Cube();
body.color = [1, 0.6, 0.4, 1];  // Red
body.matrix.translate(-0.25, -0.5, 0.0);
body.matrix.rotate(-5, 1, 0, 0);  // Slight rotation
var bodyCoords = new Matrix4(body.matrix);  // Copy body matrix
var bodyCoords2 = new Matrix4(body.matrix);
var bodyCoordsLeftArm = new Matrix4(body.matrix);
var bodyCoordsRightArm = new Matrix4(body.matrix);
var bodyHead = new Matrix4(body.matrix);
body.matrix.scale(0.5, 0.5, 0.4);  // Scale body
body.render();

// Left Upper Leg (Thigh)
var leftUpperLeg = new Cube();
leftUpperLeg.color = [1, 0.6, 0.4, 1];  // Yellow
leftUpperLeg.matrix = bodyCoords;  // Copy matrix, not reference
leftUpperLeg.matrix.translate(0, -0.2, 0);  // Position relative to body
leftThighCoords = leftUpperLeg.matrix;
leftUpperLeg.matrix.scale(0.25, 0.3, 0.3);  // Thicker thigh
leftUpperLeg.render();

// Left Lower Leg (Shin/Foot)
var leftLowerLeg = new Cube();
leftLowerLeg.color = [1, 0.6, 0.4, 1];  
leftLowerLeg.matrix = leftThighCoords;  
leftLowerLeg.matrix.translate(0.1, -0.4, -0.002);  // Move downward
leftLowerLeg.matrix.scale(0.8, 0.7, 0.8);  // Taper lower leg
leftLowerLeg.render();

// Right Upper Leg (Thigh)
var rightUpperLeg = new Cube();
rightUpperLeg.color = [1, 0.6, 0.4, 1];
rightUpperLeg.matrix = bodyCoords2;
rightUpperLeg.matrix.translate(0.24, -0.2, 0)
rightThighCoords = rightUpperLeg.matrix;
rightUpperLeg.matrix.scale(0.25, 0.3, 0.4);
rightUpperLeg.render();

// Right Lower Leg (Shin/Foot)
var rightLowerLeg = new Cube();
rightLowerLeg.color = [1, 0.6, 0.4, 1];
rightLowerLeg.matrix = rightThighCoords;
rightLowerLeg.matrix.translate(0.1, -0.4, -0.002);
rightLowerLeg.matrix.scale(0.8, 0.7, 0.8);
rightLowerLeg.render();


// Left Upper Arm
var leftUpperArm = new Cube();
leftUpperArm.color = [1, 0.6, 0.4, 1];
leftUpperArm.matrix= bodyCoordsLeftArm;
leftUpperArm.matrix.translate(-0.15, 0.3, 0.0);  // Move to shoulder position
leftUpperArm.matrix.rotate(g_leftArmAngle, 0, 0, 1)
leftArmCoords = leftUpperArm.matrix;
leftUpperArm.matrix.scale(0.15, 0.2, 0.2);  // Thicker for upper arm
leftUpperArm.render();

// Left Elbow Joint
var leftElbow = new Cube();
leftElbow.color = [1, 0.6, 0.4, 1];  // Gray
leftElbow.matrix = leftArmCoords;
leftElbow.matrix.translate(-0.02, -0.7, 0.0);  // Move downward from upper arm
leftElbow.matrix.rotate(g_leftElbowAngle, g_leftElbowAngle, g_leftElbowAngle, 1)
leftElbow.matrix.scale(1, 1, 1);  // Slightly smaller for joint
leftElbow.render();

// === Right Arm ===
// Right Upper Arm
var rightUpperArm = new Cube();
rightUpperArm.color = [1, 0.6, 0.4, 1];  // Green
rightUpperArm.matrix = bodyCoordsRightArm;
rightUpperArm.matrix.translate(.48, 0.3, 0.0);  // Opposite side
rightUpperArm.matrix.rotate(g_rightArmAngle, 0, 0, 1)
rightArmCoords = rightUpperArm.matrix
rightUpperArm.matrix.scale(0.15, 0.2, 0.2);
rightUpperArm.render();

// Right Elbow Joint
var rightElbow = new Cube();
rightElbow.color = [1, 0.6, 0.4, 1];  // Gray
rightElbow.matrix = rightArmCoords;
rightElbow.matrix.translate(-0.02, -0.7, 0.0);
rightElbow.matrix.rotate(g_rightElbowAngle, g_rightElbowAngle, g_rightElbowAngle, 1)
rightElbow.matrix.scale(1, 1, 1);
rightElbow.render();

// Head
var head = new Cube();
head.color = [1, 0.6, 0.4, 1];
head.matrix = bodyHead;
head.matrix.translate(-.03, 0.5, -0.08);
head.matrix.rotate(g_headAngle,0,1,0)
headCoordsLeft = new Matrix4(head.matrix);
headCoordsRight = new Matrix4(head.matrix);
headCoordsEyes = new Matrix4(head.matrix);
headCoordsEyesLeft = new Matrix4(head.matrix);
headCoordsNose = new Matrix4(head.matrix);
head.matrix.scale(.55, .55, .55);
head.render()

// Eyes
var rightEye = new Cube();
rightEye.color = [0,0,0,1];
rightEye.matrix = headCoordsEyes;
rightEye.matrix.translate(.01, 0.25, -0.001);
rightEye.matrix.scale(.15, .15, 0);
rightEye.render()

var leftEye = new Cube();
leftEye.color = [0,0,0,1];
leftEye.matrix = headCoordsEyesLeft;
leftEye.matrix.translate(.37, 0.25, -0.001);
leftEye.matrix.scale(.15, .15, 0);
leftEye.render()

// Nose
var nose = new Cube();
nose.color = [1,.75,.79,1];
nose.matrix = headCoordsNose;
nose.matrix.translate(0.2, 0.1, -0.001);
nose.matrix.scale(.12, .15, .05);
nose.render()

// Left Ears
var leftEar = new Cube();
leftEar.color = [1, 0.6, 0.4, 1];  // Slightly darker color for contrast
leftEar.matrix = headCoordsLeft;
leftEar.matrix.translate(0.4, 0.5, 0.15);  // Position on top-left of head
leftEar.matrix.rotate(-15, 0, 0, 1);  // Angle outward slightly
leftEar.matrix.scale(0.2, 0.3, 0.2);  // Make it tall and pointy
leftEar.render();

// Right Ear
var rightEar = new Cube();
rightEar.color = [1, 0.6, 0.4, 1];  // Matching color
rightEar.matrix = headCoordsRight;
rightEar.matrix.translate(-0.01, 0.45, 0.15);  // Position on top-right of head
rightEar.matrix.rotate(50, 0, 0, 1);  // Angle outward slightly
rightEar.matrix.scale(0.2, 0.3, 0.2);  // Make it tall and pointy
rightEar.render();

    var duration = performance.now() - startTime;
    sendTextToHtml(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot")
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





