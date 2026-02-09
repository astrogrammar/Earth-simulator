(function () {
  'use strict';

  // ============================================================
  // Constants
  // ============================================================
  var SUN_RADIUS = 2;          // same size as Earth
  var EARTH_RADIUS = 2;
  var ORBIT_RADIUS = 40;
  var AXIAL_TILT = THREE.MathUtils.degToRad(23.4);
  var ORBIT_SPEED = 0.03;      // radians per second (30% of original 0.1)
  var ROTATION_SPEED = (2 * Math.PI) / 5; // 1 revolution per 5 seconds
  var LAT_LON_INTERVAL_FAR = 30;
  var LAT_LON_INTERVAL_NEAR = 10;
  var ZOOM_THRESHOLD = 20;     // camera-to-earth distance for LOD switch
  var CAMERA_INITIAL_DISTANCE = 80;
  var CAMERA_MIN_DISTANCE = 5;
  var CAMERA_MAX_DISTANCE = 200;
  var LINE_COLOR_RED = 0xff3333;
  var LINE_COLOR_YELLOW = 0xffdd00;
  var EQUATOR_LINE_WIDTH = 1;   // Note: linewidth >1 only works on some platforms
  var GRID_LINE_WIDTH = 1;
  var ECLIPTIC_LINE_WIDTH = 1;
  var ORBIT_COLOR = 0xffffff;
  var EARTH_COLOR = 0x1144aa;
  var SUN_COLOR_CENTER = 0xffffff;   // white core
  var SUN_GLOW_COLOR = 0xffcc00;    // yellow glow
  var AXIS_LENGTH = EARTH_RADIUS * 1.8;  // pole axis extends beyond surface
  var CONTINENT_COLOR = 0x33aa44;
  var PAN_SPEED = 0.003;
  var ROTATE_SPEED = 0.005;

  // ============================================================
  // Simplified continent data (lon, lat pairs in degrees)
  // ============================================================
  var CONTINENT_DATA = [
    // Africa
    [
      [-17,14.7],[-13,12],[0,4],[9,4],[10,2],[9.5,1],[9.3,-1],[12,-5],[14,-4.5],
      [17.5,-8],[25,-10],[30,-15],[35,-22],[32.5,-26],[28,-33.5],[18,-34.8],
      [17.5,-32],[15,-28],[12.5,-17],[12,-6],[10.5,-1],[5,5],[2,6],[-1,5],
      [-8,5],[-13,8.5],[-16,12],[-17,14.7]
    ],
    // Europe
    [
      [-9.5,36],[0,36],[3,37],[5,44],[2,47],[-1,43],[-5,43],[-9,43],[-9,40],
      [-9.5,36]
    ],
    [
      [5,44],[3,43],[5,40],[7.5,44],[6.5,46],[8,47.5],[6,49],[2,51],[4,52],
      [8,54],[6,55],[9,55],[10,57.5],[12,56],[13,54.5],[14,53.5],[18,55],
      [21,55],[24,57.5],[28,60],[25,60],[24,64],[26,65],[24,66],[20,63.5],
      [18,57],[16,54.5],[14.5,53],[12.5,54.5],[10,54.5],[8,53],[3.5,51],
      [1.5,51],[0,50],[-2,49],[-5,48],[0,46],[-1,43],[2,47],[5,44]
    ],
    // Asia
    [
      [26,40],[30,37],[33,35],[35,33],[35,30],[40,28],[44,27],[44,12.5],
      [50,12.5],[52,18],[55,22],[57,25.5],[60,25],[62,22],[65,25],[67,25],
      [68,23.5],[72,21],[77,8],[80,9.5],[80,13],[82,17],[85,21],[87,22],
      [89,22],[89,26],[92,22],[95,16],[98,16],[99,13],[100,13.5],[101,3],
      [104,1],[108,15],[109,21],[106,22],[107,16.5],[105,10],[103,4],
      [104,1],[108,22],[117,23],[120,22],[118,24.5],[121,25],[121,31],
      [118,32],[120,36],[122,37],[121,39],[117.5,39],[118,40],[121,40],
      [125,43],[131,43],[131,45],[135,48],[140,46],[141,43],[145,44],
      [142,47],[135,49],[131,48],[129,44],[127,42],[129,35],[126,35],
      [129,33],[132,33.5],[131,31],[136,35],[140,35],[140,38],[139.5,42],
      [141,45],[145,43.5],[146,49],[144,54],[143,52],[138,47],[134,48],
      [130,48],[130,56],[135,63],[142,60],[150,60],[160,60],[170,63],
      [180,65],[180,70],[170,70],[160,72],[150,72],[140,67],[130,67],
      [120,72],[110,73],[100,72],[90,72],[80,70],[70,73],[60,72],
      [55,70],[50,70],[40,67],[33,65],[30,60],[28,57],[30,55],[28,50],
      [27,42],[26,40]
    ],
    // North America
    [
      [-60,48],[-65,43],[-70,41],[-75,36],[-81,25],[-81,28],[-82,29],
      [-85,30],[-90,29],[-91,30],[-93,29],[-94,29.5],[-97,26],[-97,28],
      [-103,29],[-105,31],[-108,32],[-115,32],[-117,33],[-120,34],
      [-122,37],[-124,40],[-124,45],[-123,48],[-130,55],[-135,58],
      [-140,60],[-150,61],[-155,58],[-160,55],[-165,61],[-168,66],
      [-165,68],[-155,71],[-140,70],[-130,70],[-120,70],[-110,68],
      [-100,70],[-90,70],[-85,68],[-80,63],[-82,62],[-80,60],[-78,56],
      [-76,53],[-70,47],[-60,48]
    ],
    // South America
    [
      [-80,9],[-77,8],[-72,11],[-67,10],[-63,10],[-60,8],[-60,5],
      [-52,4],[-50,2],[-50,0],[-48,-2],[-44,-2.5],[-41,-3],[-38,-4],
      [-35,-6],[-35,-10],[-37,-12],[-39,-15],[-40,-20],[-41,-22],
      [-44,-23],[-48,-28],[-50,-30],[-52,-33],[-53,-33],[-58,-36],
      [-62,-38],[-65,-42],[-65,-46],[-67,-46],[-68,-50],[-68,-53],
      [-73,-50],[-74,-46],[-74,-42],[-72,-37],[-71,-30],[-70,-18],
      [-75,-15],[-76,-10],[-77,-5],[-80,0],[-78,2],[-77,4],[-80,9]
    ],
    // Australia
    [
      [132,-12],[136,-12],[137,-16],[136,-15],[131,-14],[129,-15],
      [127,-14],[125,-15],[122,-18],[117,-20],[114,-22],[114,-26],
      [115,-34],[117,-35],[122,-34],[130,-32],[134,-33],[137,-35],
      [140,-38],[146,-39],[150,-37],[153,-27],[150,-23],[146,-19],
      [144,-15],[142,-11],[139,-12],[136,-12],[132,-12]
    ]
  ];

  // ============================================================
  // Scene Setup
  // ============================================================
  var canvas = document.getElementById('canvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);

  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, CAMERA_INITIAL_DISTANCE * 0.6, CAMERA_INITIAL_DISTANCE * 0.8);
  camera.lookAt(0, 0, 0);

  // Ambient light
  scene.add(new THREE.AmbientLight(0x333344, 0.5));

  // ============================================================
  // Sun
  // ============================================================
  var sunGeom = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
  var sunMat = new THREE.MeshBasicMaterial({ color: SUN_COLOR_CENTER });
  var sunMesh = new THREE.Mesh(sunGeom, sunMat);
  scene.add(sunMesh);

  // Sun glow (slightly larger transparent sphere)
  var glowGeom = new THREE.SphereGeometry(SUN_RADIUS * 1.3, 32, 32);
  var glowMat = new THREE.MeshBasicMaterial({
    color: SUN_GLOW_COLOR,
    transparent: true,
    opacity: 0.25
  });
  scene.add(new THREE.Mesh(glowGeom, glowMat));

  // Sun light
  var sunLight = new THREE.PointLight(0xffffff, 1.5, 300);
  scene.add(sunLight);

  // ============================================================
  // Earth pivot & mesh
  // ============================================================
  // orbitPivot rotates around Y to create orbital motion
  var orbitPivot = new THREE.Object3D();
  scene.add(orbitPivot);

  // earthSystem is placed at ORBIT_RADIUS on the X axis of orbitPivot,
  // then tilted by AXIAL_TILT around Z (in orbit-local coords)
  var earthSystem = new THREE.Object3D();
  earthSystem.position.set(ORBIT_RADIUS, 0, 0);
  orbitPivot.add(earthSystem);

  // tiltGroup applies the axial tilt
  var tiltGroup = new THREE.Object3D();
  tiltGroup.rotation.z = AXIAL_TILT;
  earthSystem.add(tiltGroup);

  // Earth mesh inside tiltGroup
  var earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
  var earthMat = new THREE.MeshPhongMaterial({
    color: EARTH_COLOR,
    shininess: 25
  });
  var earthMesh = new THREE.Mesh(earthGeom, earthMat);
  tiltGroup.add(earthMesh);

  // ============================================================
  // Earth axis line (through poles, extending beyond surface)
  // ============================================================
  var axisPoints = [
    new THREE.Vector3(0, -AXIS_LENGTH, 0),
    new THREE.Vector3(0, AXIS_LENGTH, 0)
  ];
  var axisGeom = new THREE.BufferGeometry().setFromPoints(axisPoints);
  var axisMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
  tiltGroup.add(new THREE.Line(axisGeom, axisMat));

  // ============================================================
  // Continent outlines on Earth
  // ============================================================
  var continentGroup = new THREE.Object3D();
  tiltGroup.add(continentGroup);

  function latLonToSphere(lat, lon, radius) {
    var phi = THREE.MathUtils.degToRad(90 - lat);
    var theta = THREE.MathUtils.degToRad(lon);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  var continentMaterial = new THREE.LineBasicMaterial({ color: CONTINENT_COLOR });

  CONTINENT_DATA.forEach(function (outline) {
    var points = [];
    outline.forEach(function (coord) {
      points.push(latLonToSphere(coord[1], coord[0], EARTH_RADIUS * 1.002));
    });
    var geom = new THREE.BufferGeometry().setFromPoints(points);
    continentGroup.add(new THREE.Line(geom, continentMaterial));
  });

  // ============================================================
  // Latitude / Longitude lines on Earth (LOD groups)
  // ============================================================
  var gridGroupFar = new THREE.Object3D();   // 30-degree interval
  var gridGroupNear = new THREE.Object3D();  // 10-degree interval
  tiltGroup.add(gridGroupFar);
  tiltGroup.add(gridGroupNear);
  gridGroupNear.visible = false;

  function createLatLine(latDeg, radius, isEquator) {
    var segments = 72;
    var points = [];
    for (var i = 0; i <= segments; i++) {
      var lon = (i / segments) * 360 - 180;
      points.push(latLonToSphere(latDeg, lon, radius));
    }
    var geom = new THREE.BufferGeometry().setFromPoints(points);
    var mat = new THREE.LineBasicMaterial({
      color: LINE_COLOR_RED,
      linewidth: isEquator ? EQUATOR_LINE_WIDTH : GRID_LINE_WIDTH
    });
    return new THREE.Line(geom, mat);
  }

  function createLonLine(lonDeg, radius) {
    var segments = 72;
    var points = [];
    for (var i = 0; i <= segments; i++) {
      var lat = (i / segments) * 180 - 90;
      points.push(latLonToSphere(lat, lonDeg, radius));
    }
    var geom = new THREE.BufferGeometry().setFromPoints(points);
    var mat = new THREE.LineBasicMaterial({
      color: LINE_COLOR_RED,
      linewidth: GRID_LINE_WIDTH
    });
    return new THREE.Line(geom, mat);
  }

  function buildGrid(group, interval) {
    var r = EARTH_RADIUS * 1.001;
    // Latitude lines
    for (var lat = -90; lat <= 90; lat += interval) {
      group.add(createLatLine(lat, r, lat === 0));
    }
    // Longitude lines
    for (var lon = -180; lon < 180; lon += interval) {
      group.add(createLonLine(lon, r));
    }
  }

  buildGrid(gridGroupFar, LAT_LON_INTERVAL_FAR);
  buildGrid(gridGroupNear, LAT_LON_INTERVAL_NEAR);

  // ============================================================
  // Ecliptic longitude lines (yellow, relative to ecliptic plane)
  // ============================================================
  // Ecliptic lines are drawn in earthSystem (before tilt), so they
  // align with the ecliptic plane, not the equatorial plane.
  var eclipticGridGroup = new THREE.Object3D();
  earthSystem.add(eclipticGridGroup);

  function createEclipticLonLine(lonDeg) {
    var segments = 72;
    var points = [];
    var r = EARTH_RADIUS * 1.003;
    for (var i = 0; i <= segments; i++) {
      var eclLat = (i / segments) * 180 - 90;
      // Convert ecliptic (eclLat, lonDeg) to Cartesian on sphere
      var phi = THREE.MathUtils.degToRad(90 - eclLat);
      var theta = THREE.MathUtils.degToRad(lonDeg);
      var x = -r * Math.sin(phi) * Math.cos(theta);
      var y = r * Math.cos(phi);
      var z = r * Math.sin(phi) * Math.sin(theta);
      points.push(new THREE.Vector3(x, y, z));
    }
    var geom = new THREE.BufferGeometry().setFromPoints(points);
    var mat = new THREE.LineBasicMaterial({
      color: LINE_COLOR_YELLOW,
      linewidth: ECLIPTIC_LINE_WIDTH
    });
    return new THREE.Line(geom, mat);
  }

  // Ecliptic equator (the great circle of the ecliptic plane on Earth's surface)
  function createEclipticEquator() {
    var segments = 144;
    var points = [];
    var r = EARTH_RADIUS * 1.003;
    for (var i = 0; i <= segments; i++) {
      var theta = THREE.MathUtils.degToRad((i / segments) * 360);
      var x = -r * Math.cos(theta);
      var y = 0;
      var z = r * Math.sin(theta);
      points.push(new THREE.Vector3(x, y, z));
    }
    var geom = new THREE.BufferGeometry().setFromPoints(points);
    var mat = new THREE.LineBasicMaterial({
      color: LINE_COLOR_YELLOW,
      linewidth: ECLIPTIC_LINE_WIDTH
    });
    return new THREE.Line(geom, mat);
  }

  for (var eLon = 0; eLon < 360; eLon += 30) {
    eclipticGridGroup.add(createEclipticLonLine(eLon));
  }
  eclipticGridGroup.add(createEclipticEquator());

  // ============================================================
  // Orbital path
  // ============================================================
  var orbitPoints = [];
  for (var i = 0; i <= 128; i++) {
    var angle = (i / 128) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(
      Math.cos(angle) * ORBIT_RADIUS,
      0,
      Math.sin(angle) * ORBIT_RADIUS
    ));
  }
  var orbitLineGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  var orbitLineMat = new THREE.LineBasicMaterial({
    color: ORBIT_COLOR,
    transparent: true,
    opacity: 0.3
  });
  scene.add(new THREE.Line(orbitLineGeom, orbitLineMat));

  // ============================================================
  // Seasonal markers on orbital path
  // ============================================================
  // The tilt axis (Z in tiltGroup) is fixed relative to earthSystem,
  // which rotates with orbitPivot. The axial tilt is around the local Z
  // axis of earthSystem. The "north pole tilts toward the sun" happens
  // when the earth is at a specific orbital angle.
  //
  // In our setup, at orbitPivot.rotation.y = 0 the earth is at +X.
  // The tilt is around Z, so the north pole tilts toward +X when
  // earthSystem is at +X. That means at orbital angle 0 the north pole
  // points toward the sun — this is summer solstice (for northern hemisphere).
  //
  // Orbital angles (orbitPivot.rotation.y increases => counter-clockwise from top):
  //   Summer Solstice: angle = 0       => position (+X, 0, 0)
  //   Autumnal Equinox: angle = pi/2   => position (0, 0, -X)  (note: rotation.y)
  //   Winter Solstice: angle = pi       => position (-X, 0, 0)
  //   Vernal Equinox: angle = 3pi/2    => position (0, 0, +X)
  //
  // But rotation around Y: at angle a, x = R*cos(a), z = -R*sin(a) for THREE.js rotation.

  var seasonData = [
    { angle: 0, label: '夏至\nSummer Solstice' },
    { angle: Math.PI / 2, label: '秋分\nAutumnal Equinox' },
    { angle: Math.PI, label: '冬至\nWinter Solstice' },
    { angle: (3 * Math.PI) / 2, label: '春分\nVernal Equinox' }
  ];

  function makeTextSprite(text) {
    var cnv = document.createElement('canvas');
    cnv.width = 256;
    cnv.height = 128;
    var ctx = cnv.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 256, 128);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    var lines = text.split('\n');
    for (var li = 0; li < lines.length; li++) {
      ctx.fillText(lines[li], 128, 40 + li * 28);
    }
    var texture = new THREE.CanvasTexture(cnv);
    var mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(12, 6, 1);
    return sprite;
  }

  var markerGeom = new THREE.SphereGeometry(0.6, 8, 8);
  var markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  seasonData.forEach(function (sd) {
    var x = ORBIT_RADIUS * Math.cos(sd.angle);
    var z = -ORBIT_RADIUS * Math.sin(sd.angle);

    var marker = new THREE.Mesh(markerGeom, markerMat);
    marker.position.set(x, 0, z);
    scene.add(marker);

    var sprite = makeTextSprite(sd.label);
    sprite.position.set(x, 5, z);
    scene.add(sprite);
  });

  // ============================================================
  // Camera Controller (custom, no OrbitControls)
  // ============================================================
  var cameraState = {
    spherical: new THREE.Spherical(
      CAMERA_INITIAL_DISTANCE,
      Math.PI / 3,    // phi (polar angle from Y+)
      Math.PI / 6     // theta (azimuthal angle)
    ),
    target: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    isPanning: false,
    previousMouse: { x: 0, y: 0 },
    touchCount: 0,
    pinchStartDist: 0,
    pinchStartRadius: 0,
    touchCenter: { x: 0, y: 0 }
  };

  function updateCameraFromSpherical() {
    var s = cameraState.spherical;
    s.radius = THREE.MathUtils.clamp(s.radius, CAMERA_MIN_DISTANCE, CAMERA_MAX_DISTANCE);
    s.phi = THREE.MathUtils.clamp(s.phi, 0.05, Math.PI - 0.05);
    camera.position.setFromSpherical(s).add(cameraState.target);
    camera.lookAt(cameraState.target);
  }

  updateCameraFromSpherical();

  // --- Mouse events ---
  canvas.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
      cameraState.isDragging = true;
    } else if (e.button === 2) {
      cameraState.isPanning = true;
    }
    cameraState.previousMouse.x = e.clientX;
    cameraState.previousMouse.y = e.clientY;
  });

  canvas.addEventListener('mousemove', function (e) {
    var dx = e.clientX - cameraState.previousMouse.x;
    var dy = e.clientY - cameraState.previousMouse.y;
    cameraState.previousMouse.x = e.clientX;
    cameraState.previousMouse.y = e.clientY;

    if (cameraState.isDragging) {
      cameraState.spherical.theta -= dx * ROTATE_SPEED;
      cameraState.spherical.phi -= dy * ROTATE_SPEED;
      updateCameraFromSpherical();
    } else if (cameraState.isPanning) {
      var right = new THREE.Vector3();
      var up = new THREE.Vector3();
      camera.getWorldDirection(new THREE.Vector3());
      right.crossVectors(camera.up, new THREE.Vector3().subVectors(camera.position, cameraState.target).normalize()).normalize();
      up.copy(camera.up);
      var panScale = cameraState.spherical.radius * PAN_SPEED;
      cameraState.target.add(right.multiplyScalar(-dx * panScale));
      cameraState.target.add(up.multiplyScalar(dy * panScale));
      updateCameraFromSpherical();
    }
  });

  canvas.addEventListener('mouseup', function () {
    cameraState.isDragging = false;
    cameraState.isPanning = false;
  });

  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    var earthWorldPos = new THREE.Vector3();
    earthMesh.getWorldPosition(earthWorldPos);
    // Smoothly shift target toward Earth as we zoom in
    var zoomFactor = 1 + e.deltaY * 0.001;
    var newRadius = cameraState.spherical.radius * zoomFactor;
    newRadius = THREE.MathUtils.clamp(newRadius, CAMERA_MIN_DISTANCE, CAMERA_MAX_DISTANCE);
    // Interpolate target toward Earth when zooming in, toward origin when zooming out
    var t = 1 - THREE.MathUtils.clamp((newRadius - CAMERA_MIN_DISTANCE) / (CAMERA_INITIAL_DISTANCE - CAMERA_MIN_DISTANCE), 0, 1);
    cameraState.target.lerpVectors(new THREE.Vector3(0, 0, 0), earthWorldPos, t);
    cameraState.spherical.radius = newRadius;
    updateCameraFromSpherical();
  }, { passive: false });

  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // --- Spacebar: toggle orbit pause/resume ---
  var orbitPaused = false;
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
      e.preventDefault();
      orbitPaused = !orbitPaused;
    }
  });

  // --- Touch events ---
  function getTouchDistance(t1, t2) {
    var dx = t1.clientX - t2.clientX;
    var dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getTouchCenter(t1, t2) {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
    };
  }

  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    cameraState.touchCount = e.touches.length;
    if (e.touches.length === 1) {
      cameraState.isDragging = true;
      cameraState.previousMouse.x = e.touches[0].clientX;
      cameraState.previousMouse.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      cameraState.isDragging = false;
      cameraState.pinchStartDist = getTouchDistance(e.touches[0], e.touches[1]);
      cameraState.pinchStartRadius = cameraState.spherical.radius;
      var center = getTouchCenter(e.touches[0], e.touches[1]);
      cameraState.touchCenter.x = center.x;
      cameraState.touchCenter.y = center.y;
      cameraState.previousMouse.x = center.x;
      cameraState.previousMouse.y = center.y;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (e.touches.length === 1 && cameraState.isDragging) {
      var dx = e.touches[0].clientX - cameraState.previousMouse.x;
      var dy = e.touches[0].clientY - cameraState.previousMouse.y;
      cameraState.previousMouse.x = e.touches[0].clientX;
      cameraState.previousMouse.y = e.touches[0].clientY;
      cameraState.spherical.theta -= dx * ROTATE_SPEED;
      cameraState.spherical.phi -= dy * ROTATE_SPEED;
      updateCameraFromSpherical();
    } else if (e.touches.length === 2) {
      // Pinch zoom (toward Earth)
      var dist = getTouchDistance(e.touches[0], e.touches[1]);
      var scale = cameraState.pinchStartDist / dist;
      var newRadius = THREE.MathUtils.clamp(cameraState.pinchStartRadius * scale, CAMERA_MIN_DISTANCE, CAMERA_MAX_DISTANCE);
      var earthWorldPos2 = new THREE.Vector3();
      earthMesh.getWorldPosition(earthWorldPos2);
      var t2 = 1 - THREE.MathUtils.clamp((newRadius - CAMERA_MIN_DISTANCE) / (CAMERA_INITIAL_DISTANCE - CAMERA_MIN_DISTANCE), 0, 1);
      cameraState.target.lerpVectors(new THREE.Vector3(0, 0, 0), earthWorldPos2, t2);
      cameraState.spherical.radius = newRadius;
      // Pan
      var center = getTouchCenter(e.touches[0], e.touches[1]);
      var pdx = center.x - cameraState.previousMouse.x;
      var pdy = center.y - cameraState.previousMouse.y;
      cameraState.previousMouse.x = center.x;
      cameraState.previousMouse.y = center.y;
      var right = new THREE.Vector3();
      var up = new THREE.Vector3();
      right.crossVectors(camera.up, new THREE.Vector3().subVectors(camera.position, cameraState.target).normalize()).normalize();
      up.copy(camera.up);
      var panScale = cameraState.spherical.radius * PAN_SPEED;
      cameraState.target.add(right.multiplyScalar(-pdx * panScale));
      cameraState.target.add(up.multiplyScalar(pdy * panScale));
      updateCameraFromSpherical();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', function (e) {
    e.preventDefault();
    cameraState.touchCount = e.touches.length;
    if (e.touches.length === 0) {
      cameraState.isDragging = false;
      cameraState.isPanning = false;
    } else if (e.touches.length === 1) {
      cameraState.isDragging = true;
      cameraState.previousMouse.x = e.touches[0].clientX;
      cameraState.previousMouse.y = e.touches[0].clientY;
    }
  }, { passive: false });

  // ============================================================
  // Window resize
  // ============================================================
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ============================================================
  // Animation Loop
  // ============================================================
  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var dt = clock.getDelta();

    // Orbit (counter-clockwise from above = positive Y rotation)
    if (!orbitPaused) {
      orbitPivot.rotation.y += ORBIT_SPEED * dt;
    }

    // Self-rotation (always runs)
    earthMesh.rotation.y += ROTATION_SPEED * dt;

    // LOD: check camera distance to Earth
    var earthWorldPos = new THREE.Vector3();
    earthMesh.getWorldPosition(earthWorldPos);
    var distToEarth = camera.position.distanceTo(earthWorldPos);

    if (distToEarth < ZOOM_THRESHOLD) {
      gridGroupFar.visible = false;
      gridGroupNear.visible = true;
    } else {
      gridGroupFar.visible = true;
      gridGroupNear.visible = false;
    }

    renderer.render(scene, camera);
  }

  animate();
})();
