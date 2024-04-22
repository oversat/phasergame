/**
 * Author: Dotta-ish, mostly based on work by Michael Hadley, mikewesthad.com
 *
 * The world assets aren't original or from a Forgotten Runes game
 * they're a demo originally from:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 *
 * The tilemap files and setup for this project come from:
 *  - https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/tree/master/examples/post-1/assets
 *  - https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
 *
 * If you want to build your own map you can use the Tiled.app editor
 * - https://gamefromscratch.com/tiled-map-editor-tutorial-series/
 * - https://doc.mapeditor.org/en/stable/
 */

// Spritesheets and animations in Phaser use a globally-scoped namespace

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  const game = new Phaser.Game(config);
  let cursors;
  let player;
  let showDebug = false;
  
  function preload() {
      this.load.image(
          "tiles",
          "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png"
      );
      this.load.tilemapTiledJSON(
          "map",
          "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilemaps/tuxemon-town.json"
      );
      // Load the spritesheet for the Cypher City character
      this.load.aseprite(
          '1718',
          'https://raw.githubusercontent.com/oversat/phasergame/main/sprites/bunnyslime192x240.png',
          'https://raw.githubusercontent.com/oversat/phasergame/main/json/1718.json'
      );
  }
  
  function create() {
      const map = this.make.tilemap({ key: "map" });
  
      const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
  
      const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
      const worldLayer = map.createLayer("World", tileset, 0, 0);
      const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);
  
      worldLayer.setCollisionByProperty({ collides: true });
  
      aboveLayer.setDepth(10);
  
      const spawnPoint = map.findObject(
          "Objects",
          (obj) => obj.name === "Spawn Point"
      );
  
      player = this.physics.add
          .sprite(spawnPoint.x, spawnPoint.y, 1718, 0)
          .setSize(20, 12)
          .setScale(2)
          .setOffset(15, 33);
  
      this.physics.add.collider(player, worldLayer);
  
      this.anims.createFromAseprite(1718);
  
      const camera = this.cameras.main;
      camera.startFollow(player);
      camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  
      cursors = this.input.keyboard.createCursorKeys();
  
      this.add
          .text(16, 16, "Change your Cypher number in the URL\nArrow keys to move", {
              font: "16px monospace",
              fill: "#000000",
              padding: { x: 20, y: 10 },
              backgroundColor: "#ffffff"
          })
          .setScrollFactor(0)
          .setDepth(30);
  
      this.input.keyboard.once("keydown-C", () => {
          this.physics.world.createDebugGraphic();
  
          const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
          worldLayer.renderDebug(graphics, {
              tileColor: null,
              collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
              faceColor: new Phaser.Display.Color(40, 39, 37, 255)
          });
      });
  }
  
  function update() {
      const speed = 175;
  
      player.body.setVelocity(0);
  
      if (cursors.left.isDown) {
          player.body.setVelocityX(-speed);
      } else if (cursors.right.isDown) {
          player.body.setVelocityX(speed);
      }
  
      if (cursors.up.isDown) {
          player.body.setVelocityY(-speed);
      } else if (cursors.down.isDown) {
          player.body.setVelocityY(speed);
      }
  
      player.body.velocity.normalize().scale(speed);
  
      if (cursors.left.isDown) {
          console.log('Playing left');
          player.anims.play('walking left', true);
      } else if (cursors.right.isDown) {
          console.log('Playing right');
          player.anims.play('walking right', true);
      } else if (cursors.up.isDown) {
          console.log('Playing north');
          player.anims.play('walking north', true);
      } else if (cursors.down.isDown) {
          console.log('Playing south');
          player.anims.play('walking south', true);
      }
       else {
          player.anims.stop();
  
          const prevVelocity = player.body.velocity.clone();
  
          if (prevVelocity.x < 0) player.setTexture(1718, "4");
          else if (prevVelocity.x > 0) player.setTexture(1718, "12");
          else if (prevVelocity.y < 0) player.setTexture(1718, "8");
          else if (prevVelocity.y > 0) player.setTexture(1718, "0");
      }
  }
  
  function getQueryStringParam(param) {
    var url = window.location.toString();
    url.match(/\?(.+)$/);
    var params = RegExp.$1;
    params = params.split("&");
    var queryStringList = {};
    for (var i = 0; i < params.length; i++) {
      var tmp = params[i].split("=");
      queryStringList[tmp[0]] = unescape(tmp[1]);
    }
    return queryStringList[param];
  }
  