 uniform float time;
varying vec2 vertexUV;
uniform sampler2D sunTexture;

float noise(vec2 p) {
  return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float n = noise(vertexUV * 10.0 + time * 0.5);
  vec3 color = vec3(1.0, 0.5, 0.0) * 0.5 * n * 2.2;
  color += texture2D(sunTexture, vertexUV).xyz;
  gl_FragColor = vec4(color, 1.0);
}