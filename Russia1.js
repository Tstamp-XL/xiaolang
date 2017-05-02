// 游戏界面组件
var TETRIS_ROWS = 20;
var TETRIS_COLS = 14;
var CELL_SIZE = 24;
// 没方块是0
var NO_BLOCK = 0;
var tetris_canvas;
var tetris_ctx;
// 记录当前积分
var curScore = 0;
// 记录当前速度
var curSpeed = 1;
// 记录曾经的最高积分
var maxScore = 0;
var curScoreEle , curSpeedEle , maxScoreEle;
var curTimer;
// 记录当前是否游戏中的旗标
var isPlaying = true;
// 记录正在下掉的四个方块
var currentFall;
// 该数组用于记录底下已经固定下来的方块。



// 创建一个canvas组件函数
var createCanvas = function(rows, cols, cellWidth, cellHeight)
{
	tetris_canvas = document.createElement("canvas");
	// 设置canvas组件的高度 宽度
	tetris_canvas.width = cols * cellWidth;
	tetris_canvas.height = rows * cellHeight;
	// 设置canvas组件的边框
	tetris_canvas.style.border = "1px solid black";
	// 获取canvas上的绘图API
	tetris_ctx = tetris_canvas.getContext('2d');
	// 绘制横向网格对应的路径
	for(var i = 1; i < TETRIS_ROWS; i++)
	{
		tetris_ctx.moveTo(0, i * CELL_SIZE);
		tetris_ctx.lineTo(TETRIS_COLS * CELL_SIZE, i * CELL_SIZE);
	}
	// 绘制竖向网络对应的路径
	for(var i = 1; i < TETRIS_COLS; i++)
	{
		tetris_ctx.moveTo(i * CELL_SIZE, 0);
		tetris_ctx.lineTo(i * CELL_SIZE, TETRIS_ROWS * CELL_SIZE);
	}
	tetris_ctx.closePath();
	// 设置笔触颜色
	tetris_ctx.strokeStyle = "#aaa";
	// 设置线条粗细
	tetris_ctx.lineWidth = 0.3;
	// 绘制线条
	tetris_ctx.stroke();
}

 
// 定义数据模型 x y color 三个属性 分表代表了方块所在的位置 颜色值
// currentFall = [
// 	{x: blockArr[rand][0].x, y : blockArr[rand][0].y, color : blockArr[rand][0].color},
// 	{x: blockArr[rand][1].x, y : blockArr[rand][1].y, color : blockArr[rand][1].color},
// 	{x: blockArr[rand][2].x, y : blockArr[rand][2].y, color : blockArr[rand][2].color},
// 	{x: blockArr[rand][3].x, y : blockArr[rand][3].y, color : blockArr[rand][3].color}
// ];


// 初始化游戏状态数据 记录游戏界面上每个位置的方块值 不同的值代表了不同的颜色
// 该数组用于记录地下已经固定的方块
var tetris_status = [];
for(var i = 0; i < TETRIS_ROWS; i++)
{
	tetris_status[i] = [];
	for(var j = 0; j < TETRIS_COLS; j++)
	{
		tetris_status[i][j] = NO_BLOCK;
	}
}

// 定义方块的颜色
colors = ["#fff", "#f00" , "#0f0" , "#00f"
	, "#c60" , "#f0f" , "#0ff" , "#609"];
// 定义几组可能出现的方块组合
var blockArr = [
	// 代表第一种可能出现的方块组合：Z
	[
		{x: TETRIS_COLS / 2 - 1 , y:0 , color:1},
		{x: TETRIS_COLS / 2 , y:0 ,color:1},
		{x: TETRIS_COLS / 2 , y:1 ,color:1},
		{x: TETRIS_COLS / 2 + 1 , y:1 , color:1}
	],
	// 代表第二种可能出现的方块组合：反Z
	[
		{x: TETRIS_COLS / 2 + 1 , y:0 , color:2},
		{x: TETRIS_COLS / 2 , y:0 , color:2},
		{x: TETRIS_COLS / 2 , y:1 , color:2},
		{x: TETRIS_COLS / 2 - 1 , y:1 , color:2}
	],
	// 代表第三种可能出现的方块组合： 田
	[
		{x: TETRIS_COLS / 2 - 1 , y:0 , color:3},
		{x: TETRIS_COLS / 2 , y:0 ,  color:3},
		{x: TETRIS_COLS / 2 - 1 , y:1 , color:3},
		{x: TETRIS_COLS / 2 , y:1 , color:3}
	],
	// 代表第四种可能出现的方块组合：L
	[
		{x: TETRIS_COLS / 2 - 1 , y:0 , color:4},
		{x: TETRIS_COLS / 2 - 1, y:1 , color:4},
		{x: TETRIS_COLS / 2 - 1 , y:2 , color:4},
		{x: TETRIS_COLS / 2 , y:2 , color:4}
	],
	// 代表第五种可能出现的方块组合：J
	[
		{x: TETRIS_COLS / 2  , y:0 , color:5},
		{x: TETRIS_COLS / 2 , y:1, color:5},
		{x: TETRIS_COLS / 2  , y:2, color:5},
		{x: TETRIS_COLS / 2 - 1, y:2, color:5}
	],
	// 代表第六种可能出现的方块组合 : 条
	[
		{x: TETRIS_COLS / 2 , y:0 , color:6},
		{x: TETRIS_COLS / 2 , y:1 , color:6},
		{x: TETRIS_COLS / 2 , y:2 , color:6},
		{x: TETRIS_COLS / 2 , y:3 , color:6}
	],
	// 代表第七种可能出现的方块组合 : ┵
	[
		{x: TETRIS_COLS / 2 , y:0 , color:7},
		{x: TETRIS_COLS / 2 - 1 , y:1 , color:7},
		{x: TETRIS_COLS / 2 , y:1 , color:7},
		{x: TETRIS_COLS / 2 + 1, y:1 , color:7}
	]
];

// 定义初始化正在掉落的方块
var initBlock = function()
{
	var rand = Math.floor(Math.random() * blockArr.length);
	// 随机生成正在掉落的方块
	currentFall = [
		{x: blockArr[rand][0].x, y : blockArr[rand][0].y, color : blockArr[rand][0].color},
		{x: blockArr[rand][1].x, y : blockArr[rand][1].y, color : blockArr[rand][1].color},
		{x: blockArr[rand][2].x, y : blockArr[rand][2].y, color : blockArr[rand][2].color},
		{x: blockArr[rand][3].x, y : blockArr[rand][3].y, color : blockArr[rand][3].color}
	];
}





window.onload = function()
{
	createCanvas(TETRIS_ROWS , TETRIS_COLS , CELL_SIZE , CELL_SIZE);
	document.body.appendChild(tetris_canvas);
	initBlock();
	curScoreEle = document.getElementById("curScoreEle");
	curSpeedEle = document.getElementById("curSpeedEle");
	maxScoreEle = document.getElementById("maxScoreEle");
}