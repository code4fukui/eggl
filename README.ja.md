# eggl

WebGL 2.0の開発を簡略化するための、軽量でモジュール化されたユーティリティのコレクションです。

## デモ

- https://code4fukui.github.io/eggl/

## 機能

- **`glutil.js`**: シェーダーのコンパイル、プログラムのリンク、バッファ（VBO、IBO、VAO）の作成など、一般的なWebGLタスクを補助するヘルパー関数。
- **`<fragment-shader>`**: `time`、`mouse`、`resolution`のuniform変数を自動的に設定し、フルスクリーンでフラグメントシェーダーを簡単に埋め込んでレンダリングするためのカスタムHTML要素。
- **`GPGPU.js`**: WebGL2のTransform Feedback機能を使用した、GPGPU（汎用GPU）コンピューティングのためのシンプルなクラス。
- **`mat4.js`**: 3D変換に不可欠な、4x4行列とベクトルの計算を行うコンパクトなライブラリ。
- **ジオメトリジェネレータ**: `torus`、`sphere`、`cube`などの形状のプロシージャルなジオメトリを生成する関数。

## 必要条件

- `GPGPU.js`および`<fragment-shader>`要素を使用するには、WebGL 2.0をサポートするブラウザが必要です。

## 使い方

### 1. 基本的な3Dシーン

この例では、`glutil.js`、`mat4.js`、`torus.js`の使用例として、ライティングされた回転するトーラスをレンダリングします。

```html
<!DOCTYPE html>
<html>
<head>
  <style>body, html { margin: 0; overflow: hidden; }</style>
</head>
<body>
  <canvas id="main-canvas"></canvas>
  <script type="module">
    import { mat4, identity, lookAt, perspective, multiply, rotate, inverse, vec3 } from './mat4.js';
    import { createVertexShader, createFragmentShader, createProgram, createVBO, createIBO, setAttributeVBO } from './glutil.js';
    import { torus } from './torus.js';

    const canvas = document.getElementById('main-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');

    const vs = `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec4 color;
      uniform mat4 mvpMatrix;
      uniform mat4 invMatrix;
      uniform vec3 lightDirection;
      varying vec4 vColor;
      void main(void){
        vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
        float diffuse = clamp(dot(normal, invLight), 0.1, 1.0);
        vColor = color * vec4(vec3(diffuse), 1.0);
        gl_Position = mvpMatrix * vec4(position, 1.0);
      }`;
    const fs = `
      precision mediump float;
      varying vec4 vColor;
      void main(void){
        gl_FragColor = vColor;
      }`;

    const prg = createProgram(gl, createVertexShader(gl, vs), createFragmentShader(gl, fs));
    
    const attLocation = [gl.getAttribLocation(prg, 'position'), gl.getAttribLocation(prg, 'normal'), gl.getAttribLocation(prg, 'color')];
    const attStride = [3, 3, 4];

    const torusData = torus(32, 32, 1.0, 2.0);
    const vboList = [createVBO(gl, torusData.position), createVBO(gl, torusData.normal), createVBO(gl, torusData.color)];
    setAttributeVBO(gl, vboList, attLocation, attStride);
    
    const ibo = createIBO(gl, torusData.index);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    const uniLocation = {
      mvpMatrix: gl.getUniformLocation(prg, 'mvpMatrix'),
      invMatrix: gl.getUniformLocation(prg, 'invMatrix'),
      lightDirection: gl.getUniformLocation(prg, 'lightDirection')
    };

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const mMatrix = mat4();
    const vMatrix = mat4();
    const pMatrix = mat4();
    const vpMatrix = mat4();
    const mvpMatrix = mat4();
    const invMatrix = mat4();

    lookAt(vMatrix, [0.0, 0.0, 10.0], [0, 0, 0], [0, 1, 0]);
    perspective(pMatrix, 45, canvas.width / canvas.height, 0.1, 100);
    multiply(vpMatrix, pMatrix, vMatrix);

    let count = 0;
    (function render(){
      gl.clearColor(0.1, 0.1, 0.1, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      count++;
      const rad = (count % 360) * Math.PI / 180;
      
      identity(mMatrix);
      rotate(mMatrix, mMatrix, rad, [0, 1, 1]);
      multiply(mvpMatrix, vpMatrix, mMatrix);
      inverse(invMatrix, mMatrix);

      gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMatrix);
      gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMatrix);
      gl.uniform3fv(uniLocation.lightDirection, [-0.5, 0.5, 0.5]);
      
      gl.drawElements(gl.TRIANGLES, torusData.index.length, gl.UNSIGNED_SHORT, 0);
      gl.flush();
      
      requestAnimationFrame(render);
    })();
  </script>
</body>
</html>
```

### 2. `<fragment-shader>`要素

HTMLにフラグメントシェーダーを直接埋め込みます。シェーダーは自動的に`time`、`mouse`、`resolution`のuniform変数を受け取ります。

```html
<script type="module" src="./fragment-shader.js"></script>
<style>
  fragment-shader {
    width: 100vw;
    height: 100vh;
  }
</style>

<fragment-shader>
#version 300 es
precision highp float;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
  outColor = vec4(color, 1.0);
}
</fragment-shader>
```

外部ファイルからシェーダーを読み込むこともできます。

```html
<script type="module" src="./fragment-shader.js"></script>
<fragment-shader src="my-shader.frag"></fragment-shader>
```
