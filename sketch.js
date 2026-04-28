// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 存放水泡的陣列

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 水泡類別
class Bubble {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.size = random(8, 20);
    this.speed = random(2, 5);
    this.color = col;
    this.alpha = 150;
  }
  update() {
    this.y -= this.speed; // 往上移動
    this.x += random(-1, 1); // 輕微左右晃動
    this.alpha -= 1.5; // 逐漸透明
  }
  display() {
    noFill();
    stroke(red(this.color), green(this.color), blue(this.color), this.alpha);
    strokeWeight(2);
    circle(this.x, this.y, this.size);
  }
  isDead() {
    return this.y < 0 || this.alpha <= 0; // 超出畫布或透明度歸零則破掉
  }
}

function draw() {
  background('#e7c6ff');

  // 置中上方文字
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, TOP);
  text("414730399朱俊圻 文字", width / 2, 20);

  // Calculate video dimensions (60% of canvas)
  let vW = width * 0.6;
  let vH = height * 0.6;
  let vX = (width - vW) / 2;
  let vY = (height - vH) / 2;

  image(video, vX, vY, vW, vH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 定義手指連線的索引分組
        let fingerParts = [
          [0, 1, 2, 3, 4],     // 大拇指
          [5, 6, 7, 8],        // 食指
          [9, 10, 11, 12],     // 中指
          [13, 14, 15, 16],    // 無名指
          [17, 18, 19, 20]     // 小妞指
        ];

        // 根據左右手設定顏色
        let handColor = hand.handedness === "Left" ? color(255, 0, 255) : color(255, 255, 0);

        // 畫出手指連線
        stroke(handColor);
        strokeWeight(4);
        for (let part of fingerParts) {
          for (let i = 0; i < part.length - 1; i++) {
            let ptA = hand.keypoints[part[i]];
            let ptB = hand.keypoints[part[i + 1]];

            // 將座標從攝影機空間映射到畫布空間
            let x1 = map(ptA.x, 0, video.width, vX, vX + vW);
            let y1 = map(ptA.y, 0, video.height, vY, vY + vH);
            let x2 = map(ptB.x, 0, video.width, vX, vX + vW);
            let y2 = map(ptB.y, 0, video.height, vY, vY + vH);
            line(x1, y1, x2, y2);
          }
        }

        // 指尖索引 (大拇指到小拇指的尖端)
        let tipIndices = [4, 8, 12, 16, 20];

        // 畫出關鍵點圓圈
        noStroke();
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          let px = map(keypoint.x, 0, video.width, vX, vX + vW);
          let py = map(keypoint.y, 0, video.height, vY, vY + vH);
          
          fill(handColor);
          circle(px, py, 16);

          // 如果是指定的指尖編號，產生水泡
          if (tipIndices.includes(i)) {
            bubbles.push(new Bubble(px, py, handColor));
          }
        }
      }
    }
  }

  // 更新與顯示水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1); // 破掉：從陣列移除
    }
  }
}
