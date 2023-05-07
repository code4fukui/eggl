import GLSL from "https://code4fukui.github.io/glsl-parser/GLSL.js";

const vs = `#version 300 es
in vec3 position;
in vec3 velocity;
in vec4 color;

uniform float time;
uniform vec2 mousePosition; // -1.0 ~ 1.0
uniform float mouseMovePower; // 0.0 ~ 1.0
uniform int imageWidth;

out vec3 vPosition;
out vec3 vVelocity;
out vec4 vColor;

void main() {
  if (mouseMovePower > 0.001) {
    vPosition = position + velocity * 0.07 * mouseMovePower;
    vec3 p = vec3(mousePosition, sin(time) * 0.25) - position;
    vVelocity = normalize(velocity + p * 0.2 * mouseMovePower);
  } else {
    int n = gl_VertexID;
    int x = n % imageWidth;
    int y = n / imageWidth;
    float w = float(imageWidth / 2);
    vPosition = vec3(float(x) / w - 1.0, -float(y) / w + 1.0, 0);
    vVelocity = velocity;
  }
  vColor = color;
}
`;


// To parse a GLSL program's source code into an AST:
const ast = GLSL.parser.parse(vs);
console.log(JSON.stringify(ast, null, 2));
