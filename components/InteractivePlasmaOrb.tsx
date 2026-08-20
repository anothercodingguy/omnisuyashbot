'use client';

import React, { useEffect, useRef } from 'react';
import { VoiceState } from './AudioOrb';

interface InteractivePlasmaOrbProps {
  state?: VoiceState;
  audioLevel?: number;
  onClick?: () => void;
  className?: string;
}

export function InteractivePlasmaOrb({
  state = 'idle',
  audioLevel = 0,
  onClick,
  className = '',
}: InteractivePlasmaOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioLevelRef = useRef(audioLevel);
  const stateRef = useRef(state);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('[WebGL] WebGL not supported on this device');
      return;
    }

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Ethereal Celestial Nebula Sphere (Soft, Gaseous, Wispy, Luminous, Pure Organic Motion)
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_audio;

      // Simplex-like 3D noise functions for smooth volumetric gas
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // Domain-Warped Fractional Brownian Motion for wispy nebula clouds & filaments
      float fbm(vec3 p) {
        float total = 0.0;
        float amp = 0.55;
        float freq = 1.0;
        for (int i = 0; i < 5; i++) {
          total += snoise(p * freq) * amp;
          freq *= 2.08;
          amp *= 0.48;
        }
        return total;
      }

      mat2 rot2D(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        float dist = length(uv);
        float baseRadius = 0.38 + u_audio * 0.03;

        // Smooth continuous autonomous time flow (NO cursor reaction)
        float t = u_time * 0.22;

        // 3D coordinates on celestial sphere
        float z2 = baseRadius * baseRadius - dist * dist;

        vec3 col = vec3(0.0);
        float alpha = 0.0;

        // Colors accurately tuned to reference image:
        // Luminous sky blue, glowing electric cyan, radiant ice white filaments, deep nebula indigo
        vec3 darkSpace = vec3(0.01, 0.03, 0.12);
        vec3 deepIndigo = vec3(0.03, 0.15, 0.55);
        vec3 royalAzure = vec3(0.08, 0.42, 0.95);
        vec3 vibrantCyan = vec3(0.15, 0.85, 1.0);
        vec3 brightWhite = vec3(0.92, 0.98, 1.0);

        if (z2 > 0.0) {
          float z = sqrt(z2);
          vec3 p = normalize(vec3(uv, z));

          // Rotate 3D volume smoothly and serenely
          p.xy = rot2D(t * 0.4) * p.xy;
          p.xz = rot2D(t * 0.25) * p.xz;
          p.yz = rot2D(t * 0.18) * p.yz;

          // Domain warping for wispy organic nebula filaments
          vec3 q = vec3(
            fbm(p * 2.2 + vec3(t * 0.2, -t * 0.15, 0.0)),
            fbm(p * 2.5 + vec3(-t * 0.15, t * 0.2, 0.4)),
            fbm(p * 2.3 + vec3(0.2, t * 0.1, -t * 0.25))
          );

          vec3 r = vec3(
            fbm(p * 3.8 + q * 1.6 + vec3(t * 0.1, -t * 0.1, 0.2)),
            fbm(p * 4.2 + q * 1.4 + vec3(-t * 0.1, t * 0.15, -0.3)),
            fbm(p * 4.0 + q * 1.5 + vec3(0.1, t * 0.12, 0.1))
          );

          float density = fbm(p * 2.0 + r * 1.8);

          // Ethereal nebula coloring
          vec3 nebula = mix(deepIndigo, royalAzure, smoothstep(-0.4, 0.15, density));
          nebula = mix(nebula, vibrantCyan, smoothstep(0.05, 0.55, density));
          nebula = mix(nebula, brightWhite, smoothstep(0.45, 0.95, density) * 0.9);

          // Luminous celestial star core hotspot
          float coreGlow = smoothstep(0.4, 0.0, dist) * 0.4;
          nebula += vibrantCyan * coreGlow;

          // Soft gaseous edge translucency (wispy cloud boundary, not a hard ball)
          float edgeSoftness = smoothstep(baseRadius, baseRadius * 0.72, dist);
          float gasEdge = 0.65 + 0.35 * edgeSoftness;

          // Soft rim fresnel illumination
          float fresnel = pow(1.0 - z, 1.8);
          nebula += mix(royalAzure, vibrantCyan, fresnel) * fresnel * 0.85;

          col = nebula;
          alpha = (0.78 + 0.22 * density) * gasEdge;
        } else {
          // Soft Ethereal Atmospheric Corona Glow (Expanding gracefully into dark space)
          float outerDist = dist - baseRadius;
          if (outerDist < 0.22) {
            float halo = pow(1.0 - (outerDist / 0.22), 2.5);
            vec3 haloCol = mix(deepIndigo, vibrantCyan, halo * 0.85);
            col = haloCol * halo * 0.75;
            alpha = halo * 0.65;
          }
        }

        // Soft outer boundary blending
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[Shader Error]', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[Program Link Error]', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const audioLocation = gl.getUniformLocation(program, 'u_audio');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let animId: number;
    const startTime = performance.now();

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
      resize();

      const elapsed = (time - startTime) * 0.001;

      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(audioLocation, audioLevelRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative w-full h-full flex items-center justify-center cursor-pointer select-none transition-transform duration-300 active:scale-98 ${className}`}
    >
      {/* Background Soft Atmospheric Glow Bloom */}
      <div className="absolute inset-0 bg-radial from-[#00E5FF]/12 via-[#1E88E5]/6 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* WebGL Ethereal Plasma Nebula Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[700px] max-h-[700px] object-contain drop-shadow-[0_0_90px_rgba(0,180,255,0.3)]"
      />
    </div>
  );
}
