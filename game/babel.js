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
// so we scope the name of the individual wizard's spritesheet as well.
// We'll use this wizardId throughout
const wizardId = getQueryStringParam("wizard") || "1945";

// this helps us below
const wizardTextureTag = `wizards-${wizardId}`;

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

  // every Wizard has a spritesheet
  this.load.aseprite(
    wizardTextureTag,
    `https://github.com/oversat/phasergame/blob/main/sprites/1718.png`,
    `https://github.com/oversat/phasergame/blob/main/json/1718.json`
  );
}

function create() {
  const map = this.make.tilemap({ key: "map" });

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createLayer("World", tileset, 0, 0);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  const spawnPoint = map.findObject(
    "Objects",
    (obj) => obj.name === "Spawn Point"
  );

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  // You can debug this by hitting the "C" key in the demo
  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, wizardTextureTag, 0)
    .setSize(20, 12)
    .setScale(2)
    .setOffset(15, 33);

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const tags = this.anims.createFromAseprite(wizardTextureTag);

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  // Help text that has a "fixed" position on the screen
  this.add
    .text(16, 16, "Change your wizard number in the URL\nArrow keys to move", {
      font: "16px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30);

  // Debug graphics
  this.input.keyboard.once("keydown-C", (event) => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });
}

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.play(
      { key: `${wizardTextureTag}-left`, startFrame: 0, repeat: -1 },
      true
    );
  } else if (cursors.right.isDown) {
    player.anims.play(
      { key: `${wizardTextureTag}-right`, startFrame: 0, repeat: -1 },
      true
    );
  } else if (cursors.up.isDown) {
    player.anims.play(
      { key: `${wizardTextureTag}-back`, startFrame: 0, repeat: -1 },
      true
    );
  } else if (cursors.down.isDown) {
    player.anims.play(
      { key: `${wizardTextureTag}-front`, startFrame: 0, repeat: -1 },
      true
    );
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture(wizardTextureTag, "4");
    else if (prevVelocity.x > 0) player.setTexture(wizardTextureTag, "12");
    else if (prevVelocity.y < 0) player.setTexture(wizardTextureTag, "8");
    else if (prevVelocity.y > 0) player.setTexture(wizardTextureTag, "0");
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
