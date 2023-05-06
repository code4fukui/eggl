#version 300 es
precision highp float;

uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

out vec4 outColor;

void main(void) {
  vec2 m = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

  // division
  float t = 0.1 / length(m - p);

  outColor = vec4(vec3(t), 1.0);
}
