var scores = [];
var chessPieces = [];
var firstPathLengths = [];
var scoreTexts = [];
var chessCount = 7;
var mainScene;
var colors = ["e74c3c","8e44ad","3498db","16a085","2ecc71","f39c12","d35400","00fff7"];
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
shuffle(colors);
class FirstScene extends Phaser.Scene {
  constructor ()
    {
        super('FirstScene');
    }

    preload() {}
    create ()
    {
    this.add.text(300 , (400), "Başlamak için tıkla !" , { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', color: "#000000", fontSize : 100});  
    this.input.on('pointerup', function (pointer) {

      this.scene.start('Demo');

      }, this);
    }
}
class Demo extends Phaser.Scene {
    constructor() {
      super({
        key: "Demo"
      });
    }
  
    preload() {}
  
    create() {
      // create board
      var config = {
        grid: getQuadGrid(this),
        width: 8,
        height: 8
      };
      this.board = new Board(this, config);
      //this.chessC = new ChessC(this.board);
      //this.chessD = new ChessD(this.board);

      // add some blockers
      for (var i = 0; i < 10; i++) {
        new Blocker(this.board);
      }
      const myhedef = new MoveableMarker(this.board);
      this.hedef = myhedef;
      for (var i = 0; i < chessCount; i++) {
        var color = '0x' + colors[i]
        chessPieces[i]  = new Chess(this.board,myhedef, color);
        chessPieces[i].rexChess.setBlocker(false);
        chessPieces[i].showMoveableArea();
        var pathL = chessPieces[i].pathFinder.getPath(this.hedef.rexChess.tileXYZ).length;
        firstPathLengths.push(pathL);   
        scoreTexts[i] = this.add.text(50 , (100 + i*100), pathL , { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', color: "#000000", fontSize : 50});
        scoreTexts[i].setBackgroundColor("#" + colors[i])
        scoreTexts[i].setFixedSize(55,60)
        scoreTexts[i].setAlign("center")
      }
      console.log(chessPieces)
      // add chess
      
      // Find path length and add them to array
      console.log(firstPathLengths)
    }
  }
  
  var getQuadGrid = function (scene) {
    var grid = scene.rexBoard.add.quadGrid({
      x: 400,
      y: 100,
      cellWidth: 100,
      cellHeight: 100,
      type: 0
    });
    return grid;
  };
  
  class Board extends RexPlugins.Board.Board {
    constructor(scene, config) {
      // create board
      super(scene, config, WHITE);
      mainScene = scene;
      // draw grid
      var graphics = scene.add.graphics({
        lineStyle: {
          width: 1,
          color: COLOR_PRIMARY,
          alpha: 1
        },
      
      });
      var counter = 0;
      this.forEachTileXY(function (tileXY, board) {
        var points = board.getGridPoints(tileXY.x, tileXY.y, true);
        if (tileXY.x%2 === 0 && tileXY.y%2 === 1){
            graphics.fillStyle(WHITE, 1);
            graphics.fillPoints(points, true);
            
            
        }
        else if (tileXY.x%2 === 1 && tileXY.y%2 === 0){
            graphics.fillStyle(WHITE, 1);
            graphics.fillPoints(points, true);
            
            
        }
        else{
            graphics.fillStyle(Black, 1);
            graphics.fillPoints(points, true);
        }
        
      });
      // enable touch events
      this.setInteractive();
    }
  }
  
  class Blocker extends RexPlugins.Board.Shape {
    constructor(board, tileXY) {
      var scene = board.scene;
      if (tileXY === undefined) {
        tileXY = board.getRandomEmptyTileXY(0);
      }
      // Shape(board, tileX, tileY, tileZ, fillColor, fillAlpha, addToBoard)
      super(board, tileXY.x, tileXY.y, 0, WALL);
      scene.add.existing(this);
      this.setScale(0.95);

    }
  }
  // Ölçülecek taşlar
  // board.removeChess(chessa, null, null, null, true)
  class Chess extends RexPlugins.Board.Shape {
    constructor(board, sabit, color, tileXY) {
      var scene = board.scene;
      if (tileXY === undefined) {
        tileXY = board.getRandomEmptyTileXY(0);
      }
      // Shape(board, tileX, tileY, tileZ, fillColor, fillAlpha, addToBoard)
      super(board, tileXY.x, tileXY.y, 0, color);
      scene.add.existing(this);
      this.setDepth(1);
      this.setScale(0.75);
  
      // add behaviors
      this.moveTo = scene.rexBoard.add.moveTo(this);
      this.pathFinder = scene.rexBoard.add.pathFinder(this, {
        occupiedTest: true
      });
      // private members
      this._markers = [];
      
      this.on(
        "board.pointerdown",
        function () {
        console.log(chessPieces) 
        !this.moveToTile(sabit)
        
        if(!this.moveTo.isRunning){
          board.removeChess(this,null, null, true);
        }
        },
      );

    }
  
    showMoveableArea() {
      this.hideMoveableArea();
      var tileXYArray = this.pathFinder.findArea();
      return this;
    }
    
    showPathLength(hedef) {
      var tileLengthArray = this.pathFinder.getPath(hedef.rexChess.tileXYZ);
      console.log(tileLengthArray.length)
    }

    hideMoveableArea() {
      for (var i = 0, cnt = this._markers.length; i < cnt; i++) {
        this._markers[i].destroy();
      }
      this._markers.length = 0;
      return this;
    }

    moveToTile(endTile) {
      console.log("moveToTile")
      console.log(this.moveTo.isRunning)
      if (this.moveTo.isRunning) {
        return false;
      }


      var tileXYArray = this.pathFinder.getPath(endTile.rexChess.tileXYZ);
      const leng = tileXYArray.length
      if (leng != 0){
        scores.push(leng)
        console.log("done")
        
      }
      
      
      this.moveAlongPath(tileXYArray);
      return true;
    }
  
    moveAlongPath(path) {
      if (path.length === 0) {
        this.showMoveableArea();
        this.alpha = 0;
        var check = 0;
        chessPieces.forEach(function(piece){
          if (piece.alpha === 0){
            check++;
          }
        if(check === chessCount){
          window.alert("Tebrikler Kazandınız !")
          mainScene.scene.restart()
          
        }
        } )
        return;
      }
      
      this.moveTo.once(
        "complete",
        function () {
          this.rexChess.setBlocker(false);
          this.moveAlongPath(path);
        },
        
        this
      );
      this.moveTo.moveTo(path.shift());
      var chessIndex = chessPieces.indexOf(this);
      scoreTexts[chessIndex].setText(path.length)
      return this;
    }
    
  }

  class MoveableMarker extends RexPlugins.Board.Shape {
    constructor(board,tileXY) {
      var scene = board.scene;
      if (tileXY === undefined) {
        tileXY = board.getRandomEmptyTileXY(0);
      }
      // Shape(board, tileX, tileY, tileZ, fillColor, fillAlpha, addToBoard)
      super(board, tileXY.x, tileXY.y, -1, QUEEN_COLOR);
      scene.add.existing(this);
      this.setScale(0.5);

    }
  }
  const COLOR_PRIMARY = 0x7643A0;
  const COLOR_LIGHT = 0x76d275;
  const COLOR_DARK = 0x00701a;
  const COLOR_C2 = 0xF236D8;
  const COLOR2_PRIMARY = 0xd81b60;
  const COLOR2_LIGHT = 0xff5c8d;


  const QUEEN_COLOR = 0xa00037;
  const WHITE = 0xFFFFFF;
  const WALL = 0XA05F35;
  const Black = 0x000000;
  var config = {
    type: Phaser.AUTO,
    backgroundColor: '#f5f5dc',
    parent: "phaser-example",
    width: 1500,
    height: 900,
    scale: {
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [FirstScene,Demo],
    plugins: {
      scene: [
        {
          key: "rexBoard",
          plugin: rexboardplugin,
          mapping: "rexBoard"
        }
      ]
    }
  };
  
  var game = new Phaser.Game(config);
