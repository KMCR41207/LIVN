import { useRef, useEffect } from 'react';

/**
 * GlassCanvas — WebGL-based background refraction shader.
 * Renders a subtle animated texture behind glass elements.
 * Falls back silently if WebGL is unavailable.
 */

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;

  // Smooth noise function
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 mouse = u_mouse / u_resolution;

    // Very slow ambient drift — organic luxury motion
    float t = u_time * 0.04;

    // Multi-layer subtle noise — silk/fabric texture simulation
    float n1 = noise(uv * 3.0 + vec2(t * 0.3, t * 0.2));
    float n2 = noise(uv * 6.0 + vec2(-t * 0.15, t * 0.25));
    float n3 = noise(uv * 12.0 + vec2(t * 0.1, -t * 0.12));
    float combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Mouse influence — very subtle ripple near cursor
    float dist = length(uv - mouse);
    float mouseInfluence = smoothstep(0.4, 0.0, dist) * 0.03;
    combined += mouseInfluence * noise(uv * 8.0 + vec2(t));

    // Luxury champagne gold palette
    // Matte black to champagne gold gradient
    vec3 colorA = vec3(0.98, 0.97, 0.96);  // Ivory #fdfbf7
    vec3 colorB = vec3(0.96, 0.93, 0.88);  // Cream #f4eee0
    vec3 colorC = vec3(0.95, 0.87, 0.67);  // Warm champagne gold tint

    vec3 color = mix(colorA, colorB, combined);
    color = mix(color, colorC, combined * combined * 0.12);

    // Very subtle vignette for depth
    float vignette = 1.0 - smoothstep(0.5, 1.2, length(uv - 0.5) * 1.4);
    color *= 0.97 + vignette * 0.03;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const GlassCanvas = ({ className = '', style = {} }) => {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL, fall back to WebGL2
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      // No WebGL — canvas stays hidden, glass falls back to CSS
      return;
    }
    glRef.current = gl;

    // Compile shader
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Full screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1, 1,
      -1,  1,  1, -1,  1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc  = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * Math.min(window.devicePixelRatio, 1.5);
      canvas.height = canvas.offsetHeight * Math.min(window.devicePixelRatio, 1.5);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Mouse tracking
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * window.devicePixelRatio,
        y: (canvas.height) - (e.clientY - rect.top) * window.devicePixelRatio
      };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Render loop
    const render = () => {
      const t = (Date.now() - startTimeRef.current) / 1000;
      gl.useProgram(program);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, t);
      gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`glass-webgl-canvas ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        borderRadius: 'inherit',
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export default GlassCanvas;
