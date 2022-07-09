let faceapi;
let faceapi2;
let video;
let detections;
let detections2;
let capture;
let theirVideo;
let detections_list_me = [];
let fukkin_ct_me = 0;
let detections_list_you = [];
let fukkin_ct_you = 0;

// by default all options are set to true
const detection_options = {
  withLandmarks: true,
  withDescriptors: false,
};

function setup() {
  createCanvas(1280, 960);

  // load up your video
  capture = createCapture({ video: { width: 640, height: 480 }, audio: false });
  //video.size(width, height);
  // video.hide(); // Hide the video element, and just show the canvas
  capture.hide(); // ビデオを消した
  faceapi = ml5.faceApi(capture, detection_options, modelReady);
  textAlign(RIGHT);

  // skywayのインスタンスを作成
  let peer = new Peer({
    key: "a3dadfd7-94d5-466e-92fb-84bba5f87981",
  });
  // skywayでドメインを許可していれば実行される
  peer.on("open", () => {
    console.log("open! id=" + peer.id);
    createP("Your id: " + peer.id);
  });

  // id入力タグの生成
  let idInput = createInput("");

  // 送信ボタンの生成
  createButton("Call").mousePressed(() => {
    // ボタンが押されたら
    const callId = idInput.value(); //id入力欄の値を取得
    console.log("call! id=" + peer.id);
    const call = peer.call(callId, capture.elt.srcObject); //id先を呼び出し
    addVideo(call);
  });

  // // 相手から呼び出された実行される
  peer.on("call", (call) => {
    console.log("be called!");
    call.answer(capture.elt.srcObject); //呼び出し相手に対して返す
    addVideo(call);
  });

  // 相手の映像を追加処理
  function addVideo(call) {
    call.on("stream", (theirStream) => {
      console.log("stream!");
      //相手のビデオを作成
      theirVideo = createVideo();
      theirVideo.elt.autoplay = true;
      theirVideo.elt.srcObject = theirStream;
      theirVideo.hide(); //キャンバスで描くので非表示

      //相手側のビデオ映像に対してfaceAPIをする
      faceapi2 = ml5.faceApi(theirVideo, detection_options, modelReady);
    });
  }
}

function modelReady() {
  console.log("ready!");
  console.log(faceapi);
  console.log(faceapi2);

  faceapi.detect(gotResults);
  if (faceapi2) {
    faceapi2.detect(gotResults2);
  }
}

// 自分の映像用
function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  detect_fukkin_me(result);
  // 自分の映像の情報を取得
  detections = result;
  faceapi.detect(gotResults);
}

// 相手の動画用
function gotResults2(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  detect_fukkin_you(result);
  // 相手の映像の情報を取得する
  detections2 = result;

  faceapi2.detect(gotResults2);
}

function draw() {
  background(255);
  // 自分の映像を表示
  if (capture) image(capture, 0, 0, 640, 480);
  // 相手の映像をx軸に640pxずらして表示する
  if (theirVideo) image(theirVideo, 640, 0, 640, 480);

  // 自分の映像に加工を入れる処理
  if (detections) {
    if (detections.length > 0) {
      // 自分の映像の場合は引数で1を渡すことにしてる
      drawLandmarks(detections, 1);
    }
  }

  // 自分の映像に加工を入れる処理
  if (detections2) {
    if (detections2.length > 0) {
      // 相手の映像の場合は引数で2を渡すことにしてる
      drawLandmarks(detections2, 2);
    }
  }
}

// マスクとバーチャルディスタンスのアラート画像の読み込み
// let img;
// let img2;

// function preload() {
//     img = loadImage('mask.png');
//     img2 = loadImage('alert.png');
// }

// 口の位置や目隠しをする処理
// 引数はそれぞれの映像から得られた情報と自分(1)or相手(2)という情報
function drawLandmarks(detections, part) {
  noFill();
  stroke(255, 0, 0);
  strokeWeight(2);

  let mouthx = 0;
  let mouthy = 0;
  let lefteye1x, lefteye1y, righteye1x, righteye1y;
  let lefteye2x, lefteye2y, righteye2x, righteye2y;

  for (let i = 0; i < detections.length; i++) {
    const mouth = detections[i].parts.mouth;

    // // 口の重心をとるためにトータルを取得する
    // mouthx = mouthx + detections[i].parts.mouth[0].x;
    // mouthy = mouthy + detections[i].parts.mouth[0].y;

    // ///////// とりあえず目を隠す実装をする。不要なら外す /////////
    // if (part == 1) { // 1なので自分の映像のとき。
    //     // 左目
    //     lefteye1x = detections[i].parts.leftEye[0].x - 50;
    //     lefteye1y = detections[i].parts.leftEye[0].y;
    //     // 右目
    //     righteye1x = detections[i].parts.rightEye[0].x + 50;
    //     righteye1y = detections[i].parts.rightEye[0].y;
    // }

    // //相手がいた時用
    // ///////// とりあえず目を隠す実装をする。不要なら外す /////////
    // if (part == 2) { // 2なので相手の映像のとき
    //     lefteye2x = detections[i].parts.leftEye[0].x - 50 + 640;
    //     lefteye2y = detections[i].parts.leftEye[0].y;
    //     // 右目
    //     righteye2x = detections[i].parts.rightEye[0].x + 50 + 640;
    //     righteye2y = detections[i].parts.rightEye[0].y;
    // }

    // // 口の位置に合わせてマスクを表示する
    // if (part == 1) image(img, detections[i].parts.mouth[0].x - 60, detections[i].parts.mouth[0].y - 60, 200, 170);
    // if (part == 2) image(img, detections[i].parts.mouth[0].x + 580, detections[i].parts.mouth[0].y - 60, 200, 170);

    // // 口の輪郭をかく
    // if (part == 1) drawPart(mouth, true);
    // if (part == 2) drawPart2(mouth, true);
  }

  // それぞれの重心
  const mouth_px = mouthx / detections.length - 50;

  ////////// 目を隠す処理 不要だったら消す//////////
  // eyeline(lefteye1x, lefteye1y, righteye1x, righteye1y);
  // if (theirVideo) eyeline(lefteye2x, lefteye2y, righteye2x, righteye2y);

  // 画面上で相手に近づき過ぎた時に警告する
  //// 今は自分の画面で右端に240px(640-400)より近づいた時に警告を出す。必要に応じて数字は変える
  // if (mouth_px > 400) {
  //     image(img2, 20, 20, 600, 100);
  // }
}

// 口の輪郭をかく処理（自分用）
function drawPart(feature, closed) {
  beginShape();
  for (let i = 0; i < feature.length; i++) {
    const x = feature[i]._x;
    const y = feature[i]._y;
    vertex(x, y);
  }

  if (closed === true) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

// 口の輪郭をかく処理（相手用）
// function drawPart2(feature, closed) {

//     beginShape();
//     for (let i = 0; i < feature.length; i++) {
//         const x = feature[i]._x + 640;
//         const y = feature[i]._y;
//         vertex(x, y);
//     }

//     if (closed === true) {
//         endShape(CLOSE);
//     } else {
//         endShape();
//     }
// }

// // 目線を隠すための関数
// function eyeline(x1, y1, x2, y2) {
//     strokeWeight(30); //線の太さ
//     stroke(0, 0, 0); //線の色 R,G,B
//     line(
//         x1, y1, x2, y2
//     );
// }

function detect_fukkin_me(result) {
  detections_list_me.push(result);
  if (result.length > 0) {
    // 現フレーム顔あり
    let i = 10; // 顔がない時の連続フレーム数
    let fukkin = detections_list_me
      .slice(-i, detections_list_me.length - 1)
      .every(function (val) {
        return val == 0;
      });
    if (fukkin) {
      // 腹筋あり
      fukkin_ct_me = fukkin_ct_me + 1;
      console.log("私" + fukkin_ct_me + "回目");
    }
  } else {
    // 現フレーム顔なし
  }
}

function detect_fukkin_you(result) {
  detections_list_you.push(result);
  if (result.length > 0) {
    // 現フレーム顔あり
    let i = 10; // 顔がない時の連続フレーム数
    let fukkin = detections_list_you
      .slice(-i, detections_list_you.length - 1)
      .every(function (val) {
        return val == 0;
      });
    if (fukkin) {
      // 腹筋あり
      fukkin_ct_you = fukkin_ct_you + 1;
      console.log("相手" + fukkin_ct_you + "回目");
    }
  } else {
    // 現フレーム顔なし
  }
}
