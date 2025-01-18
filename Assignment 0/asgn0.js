// DrawTriangle.js (c) 2012 matsuda
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to draw all vector
function drawVector() {
  const canvas = document.getElementById('example');
  const ctx = canvas.getContext('2d');

  // Clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Read vector values
  const v1x = parseFloat(document.getElementById('v1-x').value);
  const v1y = parseFloat(document.getElementById('v1-y').value);

  const v2x = parseFloat(document.getElementById('v2-x').value);
  const v2y = parseFloat(document.getElementById('v2-y').value);

  const scalar = parseFloat(document.getElementById('scalar').value);

  // Check for valid inputs
  if ((isNaN(v1x) || isNaN(v1y)) && (isNaN(v2x) || isNaN(v2y))){
      alert("Please enter valid numbers for the vector components.");
      return;
  }

  // Create vectors
  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);

  // Get operation
  const operation = document.getElementById('operation-select').value;

  drawSingleVector(ctx, v1, 'red');
  drawSingleVector(ctx, v2, 'blue');

  // Switch Case
  let v3, v4;
  switch (operation) {
    case 'add':
      v3 = v1.add(v2);
      drawSingleVector(ctx, v3, 'green');
      break;
    case 'sub':
      v3 = v1.sub(v2);
      drawSingleVector(ctx, v3, 'green');
      break;
    case 'mul':
      v3 = v1.mul(scalar);
      v4 = v2.mul(scalar);
      drawSingleVector(ctx, v3, 'green');
      drawSingleVector(ctx, v4, 'green');
      break;
    case 'div':
      v3 = v1.div(scalar);
      v4 = v2.div(scalar)
      drawSingleVector(ctx, v3, 'green');
      drawSingleVector(ctx, v4, 'green');
      break;
    case 'mag':
      console.log('v1 Magnitude: ', v1.magnitude());
      console.log('v2 Magnitude: ', v2.magnitude());
      break;
    case 'norm':
      v3 = v1.normalize();
      v4 = v2.normalize();
      drawSingleVector(ctx, v3, 'green');
      drawSingleVector(ctx, v4, 'green');
      break;
    case 'angle-between':
      console.log("Angle: ", angleBetween(v1,v2))
      break;
    case 'area':
      console.log("Area: ", area(v1, v2))
      break;
    default:
      drawSingleVector(ctx, v1, 'red');
      drawSingleVector(ctx, v2, 'blue');
      break;
  }
}

// draws a vector
function drawSingleVector(ctx, vector, color) {
  ctx.strokeStyle = color;

  // Scaling of the vector to see it better
  const scale = 20;
  const x = vector.elements[0] * scale;
  const y = vector.elements[1] * scale;

  // centers it 
  const originX = ctx.canvas.width / 2;
  const originY = ctx.canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + x, originY - y); 
  ctx.stroke();
}

function angleBetween(v1, v2) {
  const dotProduct = Vector3.dot(v1, v2);
  const magnitude1 = v1.magnitude();
  const magnitude2 = v2.magnitude();

  const cosAlpha = dotProduct / (magnitude1 * magnitude2);
  const angle = Math.acos(cosAlpha) * (180/ Math.PI); 
  return angle;
}

function area(v1, v2){
  const cross = Vector3.cross(v1, v2);
  const area = cross.elements[2] / 2;

  return Math.abs(area);
}