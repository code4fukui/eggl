// sample_069
//
// GLSL でタイマーとマウス座標に連動

// GLSL サンプルの(ほぼ)共通仕様 =============================================
// 
// ・シェーダのコンパイルに失敗した場合は auto run を無効にします
// ・auto run は 30fps になっているので環境と負荷に応じて適宜変更しましょう
// ・uniform 変数は以下のようにシェーダへ送られます 
//     ・time: 経過時間を秒単位(ミリ秒は小数点以下)で送る(float)
//     ・mouse: マウス座標を canvas 左上原点で 0 ～ 1 の範囲で送る(vec2)
//     ・resolution: スクリーンの縦横の幅をピクセル単位で送る(vec2)
// ・シェーダのコンパイルに失敗した場合エラー内容をアラートとコンソールに出力
// ・シェーダのエラーで表示される行番号は一致するように HTML を書いてあります
// 
// ============================================================================
import { createVertexShader, createFragmentShader, createProgram, setAttributeVBO, createVBO, createIBO } from "https://code4fukui.github.io/eggl/glutil.js";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.onclick = () => canvas.requestFullscreen();
document.body.style.margin = 0;
onresize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
};
onresize();

const gl = canvas.getContext("webgl2");

const vs = `#version 300 es
in vec3 position;

void main(void) {
  gl_Position = vec4(position, 1.0);
}
`;

// シェーダ周りの初期化
const prg = createProgram(gl, createVertexShader(gl, vs), createFragmentShader(gl, fs.textContent));
const timeUni = gl.getUniformLocation(prg, "time");
const mouseUni = gl.getUniformLocation(prg, "mouse");
const resolutionUni = gl.getUniformLocation(prg, "resolution");

// 頂点データ回りの初期化
const position = [
  -1.0,  1.0,  0.0,
   1.0,  1.0,  0.0,
  -1.0, -1.0,  0.0,
   1.0, -1.0,  0.0,
];
const index = [
  0, 2, 1,
  1, 2, 3,
];
const vPosition = createVBO(gl, position);
const vIndex = createIBO(gl, index);
const vAttLocation = gl.getAttribLocation(prg, "position");
gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
gl.enableVertexAttribArray(vAttLocation);
gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

// その他の初期化
gl.clearColor(0.0, 0.0, 0.0, 1.0);

let mx = 0.5;
let my = 0.5;
// イベントリスナー登録
canvas.addEventListener("mousemove", (e) => {
  mx = e.offsetX / canvas.width;
  my = e.offsetY / canvas.height;
}, true);

const startTime = performance.now();
// レンダリングを行う関数
const render = () => {
  // 時間管理
  const time = (performance.now() - startTime) / 1000;
	
  // カラーバッファをクリア
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // uniform 関連
  gl.uniform1f(timeUni, time);
	gl.uniform2fv(mouseUni, [mx, my]);
  gl.uniform2fv(resolutionUni, [canvas.width, canvas.height]);
  
  // 描画
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  gl.flush();
  
	requestAnimationFrame(render);
};
render();
