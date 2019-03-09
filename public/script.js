/*
 * invoker -- Invoker system simulator -- frames and animation example
 * Created for CS352, Calvin College Computer Science
 * Jesse Kuntz
 */

var invoker = { }
var hero, wex, lane, quas, exort, creep, sunstrike;
var intervalID, time=0, step=5, tilt=0, lastTilt=0, accelX, accelY,
    creepPosition=0, inertia=0, isStruck=false, creepAlive=true, isMobile=false;

$(document).ready(function () { invoker.init(); });

invoker.init = function () {
  invoker.canvas = $('#canvas1')[0];
  invoker.cx = invoker.canvas.getContext('2d');
  invoker.cx.fillStyle = 'rgb(255,0,0)';

  invoker.cx.setTransform(1,0,0,1,360,270);	// world frame is (-1,-1) to (1,1)

  // bind functions to events, button clicks
  $('#gobutton').bind('click', invoker.go);
  $('#stopbutton').bind('click', invoker.stop);
  $('#stepbutton').bind('click', invoker.step);
  $('#sunstrikebutton').bind('click', invoker.sunstrike);
  $('#slider1').bind('change', invoker.slider);

  if(window.DeviceMotionEvent){
    window.addEventListener("devicemotion", invoker.motion, false);
  } else {
    console.log("DeviceMotionEvent is not supported");
  }

  if( !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
    $('#tilt1').bind('change', invoker.tilt);
  } else {
    isMobile = true;
  }

  invoker.loadImages();
  lane.onload = function() { invoker.animate(); }
}

invoker.motion = function (ev){
  console.log("Accelerometer: "
    + ev.accelerationIncludingGravity.x + ", "
    + ev.accelerationIncludingGravity.y + ", "
    + ev.accelerationIncludingGravity.z
  );

  accelX = ev.accelerationIncludingGravity.x;
  accelY = ev.accelerationIncludingGravity.y;
}

invoker.animate = function() {

  // update time according to how much time has elapsed
  step = parseInt($('#slider1').val());
  time += step;
  timefrac = time/10;
  $('#timecount').text(time);

  // initially in the hero's frame. Draw hero, lane
  invoker.cx.save();
  invoker.cx.drawImage(lane, -360, -270, invoker.canvas.width, invoker.canvas.height);
  invoker.cx.drawImage(hero, 0 - hero.width/2, 0 - hero.height/2);

  // Exort
  invoker.cx.save();
  invoker.cx.translate(-150,-135);
  invoker.cx.rotate(timefrac / 20);
  invoker.cx.drawImage(exort, 0 - exort.width/2, 0 - exort.height/2);
  invoker.cx.restore();

  // Quas
  invoker.cx.save();
  invoker.cx.translate(140, -130);
  invoker.cx.rotate(timefrac / 20);
  invoker.cx.drawImage(quas, 0 - quas.width/2, 0 - quas.height/2);
  invoker.cx.restore();

  // Wex
  invoker.cx.save();
  invoker.cx.translate(0, -220);
  invoker.cx.rotate(timefrac / 20);
  invoker.cx.drawImage(wex, 0 - wex.width/2, 0 - wex.height/2);
  invoker.cx.restore();

  // Creep
  invoker.cx.save();

  // IF YOU ARE ON DESKTOP
  if (isMobile == false) {
    inertia += tilt / 30;
    creepPosition += tilt + inertia;
  }
  // IF YOU ARE ON MOBILE / SOMETHING THAT HAS AN ACCELEROMETER
  else {
    // var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
    // let vx=0, vy=0, x=0, y=0;
		// if (landscapeOrientation) {
		// 	vx = vx + accelY;
		// 	vy = vy + accelX;
		// } else {
		// 	vy = vy - accelY;
		// 	vx = vx + accelX;
		// }
		// vx = vx * 0.98;
		// vy = vy * 0.98;
		// y = parseInt(y + vy / 50);
    // x = parseInt(x + vx / 50);

    // creepPosition = x;
    var landscapeOrientation = window.innerWidth/window.innerHeight > 1;
    let movement = 0;
    if (landscapeOrientation) {
      inertia += accelY / 10;
      movement = accelY;
    }
    else {
      inertia += accelX / 10;
      movement = accelX;
    }

    creepPosition += movement / 10 + inertia;
  }

  if (creepPosition + creep.width >= 360) {
    invoker.cx.drawImage(creep, 360 - creep.width, 270 - creep.height);
    creepPosition = 360 - creep.width;
    inertia = 0;
  }
  else if (creepPosition <= -360) {
    invoker.cx.drawImage(creep, -360, 270 - creep.height);
    creepPosition = -360;
    inertia = 0;
  }
  else {
    invoker.cx.drawImage(creep, creepPosition, 270 - creep.height);
  }

  invoker.cx.restore();

  // Sunstrike
  if (isStruck && creepAlive) {
    invoker.cx.drawImage(sunstrike, creepPosition - 260, -270);
  }
}

// turn on animation: cause animate function to be called every 20ms
invoker.go = function() {
  // Stop it if it is already going... don't start another one while the first one is going.
  clearInterval(intervalID);
  intervalID =  setInterval(invoker.animate, 20);
}

invoker.stop = function() {
  clearInterval(intervalID);
}

invoker.step = function() {
  invoker.animate();
}

invoker.loadImages = function() {
  hero = new Image();       hero.src = "assets/invoker.png";
  wex = new Image();        wex.src = "assets/wex.png";
  quas = new Image();       quas.src = "assets/quas.png";
  exort = new Image();      exort.src = "assets/exort.png";
  creep = new Image();      creep.src = "assets/creep.png";
  sunstrike = new Image();  sunstrike.src = "assets/sunstrike.png";
  lane = new Image();       lane.src = "assets/lane.jpg";
}

invoker.slider = function(ev) {
  $('#pointcount').text($('#slider1').val());
}

invoker.tilt = function(ev) {
  tilt = parseInt($('#tilt1').val());
  $('#tiltcount').text(tilt);
  invoker.cx.clearRect(-500, -400, invoker.canvas.width+500, invoker.canvas.height+400);
  invoker.cx.rotate((-1 * lastTilt) * Math.PI / 180);
  invoker.cx.rotate(tilt * Math.PI / 180);
  invoker.animate();

  lastTilt = tilt;
}

invoker.sunstrike = function(ev) {
  if (creepAlive) {
    isStruck = true;
    invoker.cx.drawImage(sunstrike, creepPosition - 260, -270);

    setTimeout(() => {
      isStruck = false;
      creepAlive = false;
      creep.src = "assets/destroyed.png";
      invoker.cx.clearRect(-500, -400, invoker.canvas.width+500, invoker.canvas.height+400);
      invoker.animate();
    }, 700);
  }
}