uniform sampler2D colorTexture; 
uniform sampler2D alphaTexture;

varying vec2 vUv;
varying float vVisible;  

void main() {
  // Avoid discarding too aggressively
  if (vVisible < 0.1) discard;  // Discard if vVisible is low
  
  // Fetch alpha value, avoid the inversion unless necessary
  float alpha = 1.0 - texture(alphaTexture, vUv).r;  // Modify if needed
  if (alpha < 0.05) discard;  // Avoid rendering fully transparent parts
  
  // Fetch color from texture
  vec3 color = texture(colorTexture, vUv).rgb;
  
  // Final fragment output
  gl_FragColor = vec4(color, alpha);
}