// シェーダを生成する関数
const createShader = (gl, src, shader) => {
  // 生成されたシェーダにソースを割り当てる
  gl.shaderSource(shader, src);
  // シェーダをコンパイルする
  gl.compileShader(shader);
  // シェーダが正しくコンパイルされたかチェック
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
    // 成功していたらシェーダを返して終了
    return shader;
  } else {
    // 失敗していたらエラーログをコンソール出力する
    console.log(gl.getShaderInfoLog(shader));
  }
};
export const createVertexShader = (gl, src) => {
  return createShader(gl, src, gl.createShader(gl.VERTEX_SHADER));
};
export const createFragmentShader = (gl, src) => {
  return createShader(gl, src, gl.createShader(gl.FRAGMENT_SHADER));
};

// プログラムオブジェクトを生成しシェーダをリンクする関数
export const createProgram = (gl, vs, fs, varyings = undefined) => {
  // プログラムオブジェクトの生成
  const program = gl.createProgram();
  
  // プログラムオブジェクトにシェーダを割り当てる
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  
  // トランスフォーム用の変数がある場合
  if (varyings) {
    gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);
  }
  // シェーダをリンク
  gl.linkProgram(program);
  
  // シェーダのリンクが正しく行なわれたかチェック
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // 成功していたらプログラムオブジェクトを有効にする
    gl.useProgram(program);
    
    // プログラムオブジェクトを返して終了
    return program;
  } else {
    // 失敗していたらエラーログをコンソール出力する
    console.log(gl.getProgramInfoLog(program));
  }
};

// VBOを生成する関数
export const createVBO = (gl, data) => {
  if (!(data instanceof Float32Array)) {
    data = new Float32Array(data);
  }
  // バッファオブジェクトの生成
  const vbo = gl.createBuffer();
  // バッファをバインドする
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  // バッファにデータをセット
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // バッファのバインドを無効化
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  // 生成した VBO を返して終了
  return vbo;
};

// VBOをバインドし登録する関数
export const setAttributeVBO = (gl, vbo, attL, attS) => {
  // 引数として受け取った配列を処理する
  for (const i in vbo) {
    // バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
    // attributeLocationを有効にする
    gl.enableVertexAttribArray(attL[i]);
    // attributeLocationを通知し登録する
    gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
  }
};

// IBOを生成する関数
export const createIBO = (gl, data) => {
  // バッファオブジェクトの生成
  const ibo = gl.createBuffer();
  // バッファをバインドする
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  // バッファにデータをセット
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  // バッファのバインドを無効化
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  // 生成したIBOを返して終了
  return ibo;
};

// VAOを生成する関数
export const createVAO = (gl, vboDataArray, attL, attS, iboData = undefined) => {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  for (const i in vboDataArray) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vboDataArray[i]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attL[i]);
    gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
  }
  if (iboData) {
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(iboData), gl.STATIC_DRAW);
  }
  gl.bindVertexArray(null);
  return vao;
};
