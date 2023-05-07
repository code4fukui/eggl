import { createVertexShader, createFragmentShader, createProgram, createVBO, setAttributeVBO } from "./glutil.js";
import GLSL from "https://code4fukui.github.io/glsl-parser/GLSL.js";

export class GPGPU {
  constructor(gl, vertexshader, invars, outvars) {
    this.gl = gl;
    this.vs = vertexshader;
    this.inv = invars;
    for (const name in this.inv) {
      if (!(this.inv[name] instanceof Float32Array)) {
        this.inv[name] = new Float32Array(this.inv[name]);
      }
    }
    this.outv = outvars;
    this.invbos = Object.values(invars).map(i => createVBO(gl, i));
    this.outvbos = Object.values(outvars).map(i => createVBO(gl, i));

    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

    const ast = GLSL.parser.parse(vertexshader);
    
    const getTypes = (i) => {
      const name = i.declaration.declarations[0].identifier.identifier;
      const type = i.declaration.specified_type.specifier.specifier.token;
      const n = parseInt(type[type.length - 1]); // todo: check long, mat4 or others
      const size = isNaN(n) ? 1 : n;
      return { name, type, size };
    };

    const decs = ast.program.filter(t => t.type == "declaration_statement");
    const outsst = decs.filter(t => t.declaration.specified_type.qualifiers[0].token == "out");
    //const outnames = outsst.map(o => o.declaration.declarations[0].identifier.identifier);
    this.outs = outsst.map(getTypes);
    
    const insst = decs.filter(t => t.declaration?.specified_type?.qualifiers[0].token == "in");
    this.ins = insst.map(getTypes);
    
    const unist = ast.program.filter(t => t.declaration?.specified_type?.qualifiers[0].token == "uniform");
    this.unis = unist.map(getTypes);
    this.univ = {};

    // transform out shader
    const fs = `#version 300 es
    precision highp float;
    void main() {
      discard;
    }
    `;
    this.prog = createProgram(
      gl,
      createVertexShader(gl, vertexshader),
      createFragmentShader(gl, fs),
      this.outs.map(o => o.name),
    );

    this.attLocation = this.ins.map(i => gl.getAttribLocation(this.prog, i.name));
    this.attStride = this.ins.map(i => i.size);

    this.unis.forEach(u => u.loc = gl.getUniformLocation(this.prog, u.name));
  }
  calc(flip = false) {
    const gl = this.gl;
    gl.useProgram(this.prog);

    // set vbo
    setAttributeVBO(gl, this.invbos, this.attLocation, this.attStride);
    this.outvbos.map((o, i) => gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, o));
    
    // begin transform feedback
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.beginTransformFeedback(gl.POINTS);

    // vertex transform
    this.unis.forEach(u => {
      const v = this.univ[u.name];
      switch (u.type) {
        case "float":
          gl.uniform1f(u.loc, v);
          break;
        case "vec2":
          gl.uniform2fv(u.loc, v);
          break;
        case "int":
          gl.uniform1i(u.loc, v);
          break;
        default:
          throw new Error(u.type);
      }
    });
    const target = this.ins[0];
    gl.drawArrays(gl.POINTS, 0, this.inv[target.name].length / target.size);
    
    // end transform feedback
    gl.disable(gl.RASTERIZER_DISCARD);
    gl.endTransformFeedback();
    for (let i = 0; i < this.outvbos.length; i++) {
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, null);
    }
    if (!flip) {
      return this.outvbos;
    }
    [this.invbos, this.outvbos] = [this.outvbos, this.invbos];
    return this.invbos;
  }
}
