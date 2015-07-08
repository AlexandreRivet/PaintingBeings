var IMAGES = {};
var CURRENT_IMAGE = "";
var SNAP_COUNT = 0;

var CLOCK, TIME, START_TIME, CURRENT_TIME, TIME_APPLICATION;
var INTERVAL_ID, DURATION_ALGO;

var SCENE, CAMERA, RENDERER, CONTROLS;
var BLOB_V1, BLOB_V2;
var MODEL_5K, MODEL_100K, MODEL_1000K, GEOMETRY_5K, GEOMETRY_100K, GEOMETRY_1000K;
var TYPE_BLOB_V1 = 1;
var METERIAL_V1, MATERIAL_V2;
var DIRECTIONAL_LIGHT, AMBIENT_LIGHT;
var ROW = 71, COL = 71, RADIUS = 10000;
var DOWNSCALE_RATIO = 32;

var GEN_ALGO_TEXTURE, COLOR_TEXTURE;

var STATS = null;
var THREAD = null;

var MODE = 1;
var INTERFACE_STATE = true;
var ROTATE_ALLOWED = false;

var PARAMETERS;
var HIGH_MODE = [true, true];
var ALREADY_ASKED = [false, false];