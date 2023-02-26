// additional libraries:
//https://pagecdn.io/lib/mathjs/9.4.4/math.min.js
//https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.0/p5.js
let matrix = math.matrix();
let winsize=400; //random default value
let startTime;
let N;
let n_qubit;
const n_depth = 7;
let gates   = [];
let firstgates = [];
let draw_idx = 0; //0: draw unitary, 1: draw circuit
let pause_idx = 0;
let elapsed_tmp = 0;
let myFont;

function setup() {
  console.log('quantum tamagotchi by qma0000');
  winsize=Math.min(window.innerWidth,window.innerHeight);
  createCanvas(winsize,winsize);
  frameRate(60);
  colorMode(HSB,1.0);
  startTime = millis();
  var x = fxrand();
  if (x < (1/16)) { 
    n_qubit = 2;
  } else if (x < (4/16)) {
    n_qubit = 3;
  } else if (x < (9/16)){
    n_qubit = 4;
  } else {
    n_qubit = 5;
  } 
  
  N=math.pow(2,n_qubit);
  matrix = math.identity(N,N);
  
  //setup circuit
  for (var i = 0; i < n_depth; i++) {
    gates.push({'qubits':null,'desc':null,'mat':null}); //desc: description, mat: total matrix
    var x = fxrand();
    if (x < 0.5) {
      gates[i]['qubits'] = 1; // 1 qubit circuit
      gates[i]['mats_temp'] = [];
      gates[i]['desc'] = [];
      for (var j = 0; j < n_qubit; j++) {
        gates[i]['desc'].push({'type':null, 't':0});
        gates[i]['mats_temp'].push(null);
        var y = fxrand(); 
        var t = 4*PI*fxrand();
        if (y < 0.5) {
          gates[i]['desc'][j]['type'] = 'I';
          gates[i]['mats_temp'][j] = i_gate();
        }
        else if (y <0.6) {          
          gates[i]['desc'][j]['type'] = 'H';
          gates[i]['mats_temp'][j] = h_gate();
        }
        else if (y <0.65) {          
          gates[i]['desc'][j]['type'] = 'X';
          gates[i]['mats_temp'][j] = x_gate();
        }
        else if (y <0.7) {          
          gates[i]['desc'][j]['type'] = 'Rx';
          gates[i]['desc'][j]['t'] = t;
          gates[i]['mats_temp'][j] = rx_gate(t);
        }
        else if (y <0.75) {          
          gates[i]['desc'][j]['type'] = 'Y';
          gates[i]['mats_temp'][j] = y_gate();
        }
        else if (y <0.8) {          
          gates[i]['desc'][j]['type'] = 'Ry';
          gates[i]['desc'][j]['t'] = t;
          gates[i]['mats_temp'][j] = ry_gate(t);
        }
        else if (y <0.85) {          
          gates[i]['desc'][j]['type'] = 'Z';
          gates[i]['mats_temp'][j] = z_gate();
        }
        else if (y <0.9) {          
          gates[i]['desc'][j]['type'] = 'Rz';
          gates[i]['desc'][j]['t'] = t;
          gates[i]['mats_temp'][j] = rz_gate(t);
        }
        else if (y <0.925) {          
          gates[i]['desc'][j]['type'] = 'S';
          gates[i]['mats_temp'][j] = s_gate();
        }
        else if (y <0.95) {          
          gates[i]['desc'][j]['type'] = 'S+';
          gates[i]['mats_temp'][j] = s_gate_inv();
        }
        else if (y <0.975) {          
          gates[i]['desc'][j]['type'] = 'T';
          gates[i]['mats_temp'][j] = t_gate();
        }
        else {          
          gates[i]['desc'][j]['type'] = 'T+';
          gates[i]['mats_temp'][j] = t_gate_inv();
        }  
      }
      gates[i]['mat'] = onequbit_mat(gates[i]['mats_temp'],n_qubit);
    }
    else {
      gates[i]['qubits'] = 2;   
      gates[i]['mat_tmp'] = null;
      gates[i]['desc'] = {'type':null, 't':0, 'q0':0, 'q1':0};
      var q0 = Math.floor(fxrand() * n_qubit);
      var q1 = Math.floor(fxrand() * (n_qubit-1));
      if (q1 >= q0) { q1++; } 
      var y = fxrand();
      var t = fxrand();
      gates[i]['desc']['q0'] = q0;
      gates[i]['desc']['q1'] = q1;
      
      if (y <0.2) {          
          gates[i]['desc']['type'] = 'Rx';
          gates[i]['desc']['t'] = t;
          gates[i]['mat_tmp'] = crx_gate(t);
      }
      else if (y <0.4) {          
          gates[i]['desc']['type'] = 'Ry';
          gates[i]['desc']['t'] = t;
          gates[i]['mat_tmp'] = cry_gate(t);
      }
      else if (y <0.6) {          
          gates[i]['desc']['type'] = 'Rz';
          gates[i]['desc']['t'] = t;
          gates[i]['mat_tmp'] = crz_gate(t);
      }
      else if (y <0.8) {          
          gates[i]['desc']['type'] = 'X';
          gates[i]['mat_tmp'] = cx_gate();
      }
      else {          
          gates[i]['desc']['type'] = 'SWAP';
          gates[i]['mat_tmp'] = swap_gate();
      }
      gates[i]['mat'] = twoqubit_mat(gates[i]['mat_tmp'], q0, q1, n_qubit);
    }
  }
  for (var i = 0; i < n_depth; i++) {
    matrix = math.multiply(gates[i]['mat'], matrix);
  }
 //first gates
 for (var j = 0; j < n_qubit; j++) {
    firstgates.push({'y':0, 'v':0});
    var y = fxrand();
    var v = ( 0.25 + fxrand() ) / 500;
    var v2 = fxrand();
    if (v2 < 0.5) { v*= -1;}
    firstgates[j]['y'] = y;
    firstgates[j]['v'] = v;
 }

}

function draw() {
  //set matrix
  winsize=Math.min(window.innerWidth,window.innerHeight);
  background(0);
  let elapsedTime;
  if (pause_idx == 0) {
    elapsedTime = millis() - startTime;
  } else {
    elapsedTime = elapsed_tmp; 
  }
  let mats_first = [];
  for (var j = 0; j < n_qubit; j++) {
    if (firstgates[j]['y'] < (3/8)) {
      mats_first.push (rx_gate(elapsedTime*firstgates[j]['v']));
    }
    else if (firstgates[j]['y'] < (6/8)) {
      mats_first.push (ry_gate(elapsedTime*firstgates[j]['v']));
    }
    else {
      mats_first.push (rz_gate(elapsedTime*firstgates[j]['v']));
    }
   }
  var mat_first = onequbit_mat(mats_first,n_qubit);
  var final_matrix =  math.multiply(matrix, mat_first);
  
  if(draw_idx === 0) {
    //draw unitary
    rectMode(RADIUS);
    noStroke();
    let size_max  = 0.9*winsize/(2*N);
    var val = 0.0;
    var absval = 0.0;
    var color = 0.0;
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          val = math.subset(final_matrix, math.index(i,j));
          absval = math.sqrt(math.abs(val));
          color = 0.5;
          if (absval >= 0.001) {
            color = 0.5 + 0.5*math.arg(val) / PI;
          } 
          fill (color,0.9*math.sqrt(absval),0.9);   
          rect(winsize*(2*j+1)/(2*N), winsize*(2*i+1)/(2*N), absval*size_max, absval*size_max, 0.5*absval*size_max);
        }
      }    
    } 
  else {
    //draw circuit 
    stroke(1);
    strokeWeight(0);
    rectMode(RADIUS);    
    fontsize = winsize*0.06; 
    textFont('Times');
    textSize(fontsize);
    textAlign(CENTER, CENTER);    
    //draw qubit lines
    for (var j = 0; j < n_qubit; j++) {
      fill (1,0,1); // white 
      stroke(1);
      strokeWeight(2);
      var y = winsize*(0.2*0.5+ 0.8*(j+1)/(n_qubit+1) );  
      line(winsize*0.05, y, winsize*0.95, y);
    }
    
    //draw first gates
    for (var j = 0; j < n_qubit; j++) {
      fill (1,0,0); // black 
      stroke(1);
      strokeWeight(2);
      var x = winsize*((1)/(n_depth+2) ); 
      var y = winsize*(0.2*0.5+ 0.8*(j+1)/(n_qubit+1) );  
      rect(x, y, winsize*0.05, winsize*0.05,winsize*0.05);  
      //point
      var theta = elapsedTime*firstgates[j]['v'];
      strokeWeight(1);
      rect(x +  winsize*0.05*math.cos(theta), y+ winsize*0.05*math.sin(theta), 4, 4, 4); 
      //write gate name
      strokeWeight(0);
      fill (1,0,1); 
      if (firstgates[j]['y'] < (3/8)) {
        text('Rx',x,y);       
      } else if (firstgates[j]['y'] < (6/8)) {
        text('Ry',x,y);       
      } else {
        text('Rz',x,y);       
      }
    }
    // draw else 
    for (var i = 0; i < n_depth; i++) {
      var x = winsize*((i+2)/(n_depth+2) );       
      
      if (gates[i]['qubits'] == 1) {
        for (var j = 0; j < n_qubit; j++) {
          var y = winsize*(0.2*0.5+ 0.8*(j+1)/(n_qubit+1) );  
          switch (gates[i]['desc'][j]['type']) {
            //gates that rotation needed
            case 'Rx':
            case 'Ry':
            case 'Rz':
              fill (1,0,0); // black 
              stroke(1);
              strokeWeight(2);
              rect(x, y, winsize*0.05, winsize*0.05,winsize*0.05);  
              var theta = gates[i]['desc'][j]['t'];
              strokeWeight(1);
              rect(x +  winsize*0.05*math.cos(theta), y+ winsize*0.05*math.sin(theta), 4, 4, 4); 
              //write gate name
              strokeWeight(0);
              fill (1,0,1); // white  
              text(gates[i]['desc'][j]['type'],x,y); 
              break;
            case 'I':
              break;
            default:
              fill (1,0,0); // black 
              stroke(1);
              strokeWeight(2);
              rect(x, y, winsize*0.04, winsize*0.04);  
              //write gate name
              strokeWeight(0);
              fill (1,0,1); // white  
              text(gates[i]['desc'][j]['type'],x,y); 
              break;
          }
        }
      }
      else {
        var y0 = winsize*(0.2*0.5+ 0.8*(gates[i]['desc']['q0']+1)/(n_qubit+1) );
        var y1 = winsize*(0.2*0.5+ 0.8*(gates[i]['desc']['q1']+1)/(n_qubit+1) );
        //vertival circuit
        fill (1,0,1);
        stroke(1);
        strokeWeight(2);
        line(x, y0, x, y1);
        
        switch (gates[i]['desc']['type']) {
          case 'Rx':
          case 'Ry':
          case 'Rz':
            //control qubit
            fill (1,0,1);
            stroke(1);
            strokeWeight(2);
            rect(x, y0, 4, 4, 4); 
            fill (1,0,0); // black 
            rect(x, y1, winsize*0.05, winsize*0.05,winsize*0.05);  
            var theta = gates[i]['desc']['t'];
            strokeWeight(1);
            rect(x +  winsize*0.05*math.cos(theta), y1+ winsize*0.05*math.sin(theta), 4, 4, 4); 
            //write gate name
            strokeWeight(0);
            fill (1,0,1); // white  
            text(gates[i]['desc']['type'],x,y1); 
            break;
          case 'X':
            fill (1,0,1); // white
            stroke(1);
            strokeWeight(2);
            rect(x, y0, 4, 4, 4); 
            fill (1,0,0); // black 
            rect(x, y1, winsize*0.05, winsize*0.05,winsize*0.05);  
            line(x, y1 - winsize*0.05, x, y1 + winsize*0.05);
            line(x - winsize*0.05, y1 , x + winsize*0.05, y1);
            //write gate name
            break;
          case 'SWAP':
            fill (1,0,1); // white
            stroke(1);
            strokeWeight(1);
            line(x - winsize*0.02, y0 - winsize*0.02, x + winsize*0.02, y0 + winsize*0.02);
            line(x - winsize*0.02, y0 + winsize*0.02, x + winsize*0.02, y0 - winsize*0.02);
            line(x - winsize*0.02, y1 - winsize*0.02, x + winsize*0.02, y1 + winsize*0.02);
            line(x - winsize*0.02, y1 + winsize*0.02, x + winsize*0.02, y1 - winsize*0.02);

            break;
          default:
            break;
        }
      }
    }

  }

  
}

function windowResized() {
  winsize=Math.min(window.innerWidth,window.innerHeight);
  resizeCanvas(winsize, winsize);
}

function keyPressed() {
  if (keyCode == 83) {
    if (draw_idx === 0) {
      save("matrix.jpg");
    }
    else {
      save("circuit.jpg");}
  }
  else if (keyCode == 82) {
    //reset
    elapsed_tmp = 0;
    startTime = millis();
  }  
  else if (keyCode == 32)  {
    if (pause_idx === 0) {
      pause_idx = 1;
      elapsed_tmp = millis() - startTime;
    } else {
      pause_idx = 0;
      startTime = millis() - elapsed_tmp;
    }
  }
  else {
    if (draw_idx === 0) {
      draw_idx = 1;
    } else {
      draw_idx = 0;
    }
  }
}

//build matrix for 2-qubit gate 
function twoqubit_mat(mat, q0, q1, n_qubit){
  //mat   : 2-qubit operator matrix
  //q0, q1: qubits which operator works on
  //n_qubit: total number of qubit
  //big endian used
  const len_mat    = Math.pow(2, n_qubit);
  let   result_mat = math.zeros(len_mat,len_mat);
  let   dummy_idxs = [];
  for (var q = 0; q<n_qubit; q++) {
      if (q != q0 && q != q1) {
         dummy_idxs.push(Math.pow(2, n_qubit - q -1));
      } 
  }
  for (var i = 0; i < 4; i++) {
      let idx = Math.pow(2, n_qubit - q0 - 1)*(i>>>1) + Math.pow(2, n_qubit - q1 -1)*(i&1 ); // bitwise operator >>> , &
      
      for (var j = 0; j < 4; j++) {
        let jdx = Math.pow(2, n_qubit - q0 - 1)*(j>>>1) + Math.pow(2, n_qubit - q1 -1)*(j&1 );
        let matval = math.subset(mat, math.index(i,j));
        for (var k = 0; k < len_mat/4; k++) {
          var kdx = 0;
          for (var i_dummy = 0 ; i_dummy <n_qubit - 2; i_dummy++) {
            kdx += ((k>>>i_dummy)&1) * dummy_idxs[i_dummy]; // k into binary + multiply with number in dummy_idxs
          }
          result_mat.subset(math.index(idx+kdx, jdx+kdx), (matval));
        }  
      }
    }  
   return result_mat;
}

//build matrix for 1-qubit gates 
function onequbit_mat(mats,n_qubit){
  //mats   : 1-qubit operator matrixs
  let   result_mat = math.matrix([[1]]);
  for (var q = 0; q<n_qubit; q++) {
      result_mat = math.kron(result_mat, mats[q]);
  }
  return result_mat;
}

//quantum gates
//single qubit gates
function i_gate() {
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  return math.matrix( [ [one,zero] ,[zero, one] ]);
}
function x_gate() {
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  return math.matrix( [ [zero,one] ,[one, zero] ]);
}
function rx_gate(t) {
  const ct_2  = math.complex(math.cos(t/2),0);
  const ist_2_neg = math.complex(0,-math.sin(t/2));
  return math.matrix( [ [ct_2, ist_2_neg] , [ist_2_neg, ct_2 ] ]);
}
function y_gate() {
  const zero = math.complex(0,0);
  const imag = math.complex(0,1);
  const imag_neg = math.complex(0,-1);
  return math.matrix( [ [zero, imag_neg] ,[imag, zero] ]);
}
function ry_gate(t) {
  const ct_2  = math.complex(math.cos(t/2),0);
  const st_2  = math.complex(math.sin(t/2),0);
  const st_2_neg  = math.complex(-math.sin(t/2),0);
  return math.matrix( [ [ct_2, st_2_neg] , [st_2, ct_2 ]]);
}
function z_gate() {
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  const one_neg = math.complex(-1,0);
  return math.matrix( [ [one, zero] ,[zero, one_neg] ]);
}
function rz_gate(t) {
  //e^it = cost + i sin t
  const zero = math.complex(0,0);
  const eit_2       = math.complex(math.cos(t/2), math.sin(t/2));
  const eit_2_neg   = math.complex(math.cos(-t/2),math.sin(-t/2));
  return math.matrix( [ [eit_2_neg, zero] , [zero, eit_2] ]);
}
function h_gate() {
  const sqhalf = math.complex(math.sqrt(0.5),0);
  const sqhalf_neg = math.complex(-math.sqrt(0.5),0);
  return math.matrix( [ [sqhalf, sqhalf] ,[sqhalf, sqhalf_neg]]);
}
function s_gate() {
  const zero = math.complex(0,0);
  const imag = math.complex(0,1);
  const  one = math.complex(1,0);
  return math.matrix( [ [one, zero] ,[zero, imag] ]);
}
function s_gate_inv() {
  const zero = math.complex(0,0);
  const imag_neg = math.complex(0,-1);
  const  one = math.complex(1,0);

  return math.matrix( [ [one, zero] ,[zero, imag_neg] ]);
}
function t_gate() {
  //e^it = cost + i sin t
  const zero = math.complex(0,0);
  const  one = math.complex(1,0);
  const e_ipi_4       = math.complex(math.cos(PI/4), math.sin(PI/4));
  return math.matrix( [ [one, zero] , [zero, e_ipi_4] ]);
}
function t_gate_inv() {
  //e^it = cost + i sin t
  const zero = math.complex(0,0);
  const  one = math.complex(1,0);
  const e_ipi_4       = math.complex(math.cos(-PI/4), math.sin(-PI/4));
  return math.matrix( [ [one, zero] , [zero, e_ipi_4] ]);
}

//two qubit gates
function cx_gate() {
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  return math.matrix( [ [one,  zero, zero, zero] , [zero,  one, zero, zero], 
                        [zero, zero, zero,  one] , [zero, zero,  one, zero]]);
}
function crx_gate(t) {
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  const ct_2  = math.complex(math.cos(t/2),0);
  const ist_2_neg = math.complex(0,-math.sin(t/2));
  return math.matrix( [ [one,  zero, zero,   zero] , [zero,  one,   zero, zero], 
                        [zero, zero, ct_2, ist_2_neg] , [zero, zero, ist_2_neg, ct_2]]);
}
function cry_gate(t) {
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  const ct_2  = math.complex(math.cos(t/2),0);
  const st_2  = math.complex(math.sin(t/2),0);
  const st_2_neg  = math.complex(-math.sin(t/2),0);
  return math.matrix( [ [one,  zero, zero,   zero]     , [zero,  one, zero, zero], 
                        [zero, zero, ct_2,   st_2_neg] , [zero, zero, st_2, ct_2]]);
}
function crz_gate(t) {
  //e^it = cost + i sin t
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  const eit_2       = math.complex(math.cos(t/2), math.sin(t/2));
  const eit_2_neg   = math.complex(math.cos(-t/2),math.sin(-t/2));
  return math.matrix( [ [one,  zero,   zero,   zero] , [zero,  one, zero,  zero], 
                        [zero, zero,eit_2_neg, zero] , [zero, zero, zero, eit_2]]);
}
function swap_gate() {
  const zero = math.complex(0,0);
  const one  = math.complex(1,0);
  return math.matrix( [ [one,  zero, zero, zero] , [zero, zero, one, zero], 
                        [zero,  one, zero, zero] , [zero, zero,zero,  one]]);
}

