varying vec3 vertexNormal;

void main() {
  float intensity = pow(0.6 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
  vec3 color = vec3(1.0, 0.5, 0.0) * 0.5 * intensity;
  gl_FragColor = vec4(color, 1.0);
}