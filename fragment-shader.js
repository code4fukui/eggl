// based on https://wgld.org/d/glsl/g001.html wgld.org | GLSL: GLSL だけでレンダリングする |

import { createVertexShader, createFragmentShader, createProgram, createVBO, createIBO } from "https://code4fukui.github.io/eggl/glutil.js";

export class FragmentShader extends HTMLElement {
  constructor() {
    super();
    const fs = this.textContent.trim();
    this.textContent = "";
    this.style.display = "block";
    const canvas = document.createElement("canvas");
    this.appendChild(canvas);
    //canvas.onclick = () => canvas.requestFullscreen();
    //document.body.style.margin = 0;
    const limitw = this.getAttribute("width");
    
    const resizeHandler = () => {
      const pw = this.clientWidth;
      const ph = this.clientHeight;
      const [w, h] = (() => {
        if (!limitw) {
          return [pw, ph];
        } else if (pw > ph) {
          const w = Math.min(pw, limitw);
          const h = w / pw * ph;
          return [w, h];
        } else {
          const h = Math.min(ph, limitw);
          const w = h / ph * pw;
          return [w, h];
        }
      })();
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = pw + "px";
      canvas.style.height = ph + "px";
    };
    addEventListener("resize", resizeHandler);
    resizeHandler();
    
    const gl = canvas.getContext("webgl2");
    
    const vs = `#version 300 es
    in vec3 position;
    
    void main(void) {
      gl_Position = vec4(position, 1.0);
    }
    `;
    
    // シェーダ周りの初期化
    const prg = createProgram(gl, createVertexShader(gl, vs), createFragmentShader(gl, fs));
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
  }
};

customElements.define("fragment-shader", FragmentShader);
