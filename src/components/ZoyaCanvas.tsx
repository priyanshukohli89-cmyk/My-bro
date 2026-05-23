import { useRef, useEffect } from "react";
import { EmotionType } from "../types";

interface ZoyaCanvasProps {
  emotion: EmotionType;
  isSpeaking: boolean;
  neonColor: string; // Hex color string, e.g., "#00d2ff" (neon blue)
  voiceActivity: number; // Volume value [0..1] for dynamic lip-syncing
}

export function ZoyaCanvas({ emotion, isSpeaking, neonColor, voiceActivity }: ZoyaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    // Smooth transitions for eyes, eyebrows, mouth, shoulders
    const state = {
      eyeOpenL: 1.0,
      eyeOpenR: 1.0,
      eyebrowY: 0,
      mouthOpen: 0.1,
      mouthSmile: 0.5,
      headY: 0,
      headRot: 0,
      shoulderY: 0,
      blinkTimer: 0,
      swayHair: 0,
    };

    // Responsive sizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Render Loop
    const draw = () => {
      time += 16.67; // 60 FPS estimate
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      // Centered focus point for Zoya
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Update state animations based on emotion
      let targetEyeOpenL = 1.0;
      let targetEyeOpenR = 1.0;
      let targetEyebrowY = 0;
      let targetMouthOpen = isSpeaking ? (0.3 + voiceActivity * 0.7) : 0.05;
      let targetMouthSmile = 0.5; // neutral
      let targetHeadY = 0;
      let targetHeadRot = 0;
      let targetShoulderY = 0;

      // Handle Blinking
      state.blinkTimer += 1;
      if (state.blinkTimer > 180) { // Blink every ~3 seconds
        if (state.blinkTimer < 192) {
          targetEyeOpenL = 0.0;
          targetEyeOpenR = 0.0;
        } else {
          state.blinkTimer = 0;
        }
      }

      // Breathing physics (Gentle idle motion)
      const breath = Math.sin(time * 0.0016);
      const breathingShoulder = breath * 2.5;
      const breathingHead = (Math.sin(time * 0.0016 + 0.5)) * 1.5;

      // Sways
      state.swayHair = Math.sin(time * 0.001) * 6;

      // Transition offsets depending on active emotion
      switch (emotion) {
        case "happy":
          targetMouthSmile = 0.95;
          targetMouthOpen = isSpeaking ? (0.25 + voiceActivity * 0.6) : 0.08;
          targetEyebrowY = -2;
          targetEyeOpenL = 0.95;
          targetEyeOpenR = 0.95;
          break;
        case "thinking":
          targetHeadRot = -0.04;
          targetHeadY = -3;
          targetEyebrowY = -4;
          // Look slightly upper-left
          targetEyeOpenL = 0.9;
          targetEyeOpenR = 0.95;
          targetMouthSmile = 0.4;
          targetMouthOpen = 0.03;
          break;
        case "listening":
          // Responsive micro nods
          targetHeadY = Math.sin(time * 0.0025) * 2;
          targetEyebrowY = 1;
          targetMouthSmile = 0.55;
          targetMouthOpen = 0.02;
          break;
        case "explaining":
          // Dynamic speaking posture
          targetMouthSmile = 0.6;
          targetHeadY = Math.sin(time * 0.004) * 3;
          targetHeadRot = Math.sin(time * 0.0015) * 0.015;
          targetEyebrowY = -1;
          break;
        case "surprised":
          targetEyeOpenL = 1.3;
          targetEyeOpenR = 1.3;
          targetEyebrowY = -9;
          targetMouthSmile = 0.35;
          targetMouthOpen = 0.55;
          break;
        case "sad":
          targetHeadY = 4;
          targetEyebrowY = 3;
          targetMouthSmile = 0.15;
          targetMouthOpen = 0.04;
          // Soft lower eyes
          targetEyeOpenL = 0.7;
          targetEyeOpenR = 0.7;
          break;
        case "laughing":
          targetMouthSmile = 1.1;
          targetMouthOpen = 0.45;
          targetEyebrowY = -3;
          // Eyes squint/happily closed
          targetEyeOpenL = 0.1;
          targetEyeOpenR = 0.1;
          targetShoulderY = Math.sin(time * 0.025) * 3; // quick shake
          break;
      }

      // Linear interpolation for smooth kinematic animation
      const lerpVal = 0.15;
      state.eyeOpenL += (targetEyeOpenL - state.eyeOpenL) * lerpVal;
      state.eyeOpenR += (targetEyeOpenR - state.eyeOpenR) * lerpVal;
      state.eyebrowY += (targetEyebrowY - state.eyebrowY) * lerpVal;
      state.mouthOpen += (targetMouthOpen - state.mouthOpen) * lerpVal;
      state.mouthSmile += (targetMouthSmile - state.mouthSmile) * lerpVal;
      state.headY += (targetHeadY - state.headY) * lerpVal;
      state.headRot += (targetHeadRot - state.headRot) * lerpVal;
      state.shoulderY += (targetShoulderY - state.shoulderY) * lerpVal;

      // --- RENDER ELEMENTS ---

      // 1. Background Cinematic Flare
      const bgGrad = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy, Math.max(w, h) / 1.5);
      bgGrad.addColorStop(0, "rgba(22, 20, 48, 0.4)");
      bgGrad.addColorStop(1, "rgba(8, 7, 18, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // --- Body, Shoulders, Outfit ---
      const bodyY = cy + 120 + breathingShoulder + state.shoulderY;
      
      // Neck
      ctx.save();
      ctx.translate(cx, bodyY - 40);
      ctx.fillStyle = "#faebd7"; // Antique white skin tone under shading
      const neckGrad = ctx.createLinearGradient(-15, 0, 15, 0);
      neckGrad.addColorStop(0, "#e8cca6");
      neckGrad.addColorStop(0.5, "#fad8b3");
      neckGrad.addColorStop(1, "#c09b74");
      ctx.fillStyle = neckGrad;
      
      ctx.beginPath();
      ctx.moveTo(-18, -30);
      ctx.quadraticCurveTo(0, -25, 18, -30);
      ctx.lineTo(24, 25);
      ctx.quadraticCurveTo(0, 35, -24, 25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Futuristic Sci-Fi Outfit Collar and Shoulders
      ctx.save();
      ctx.translate(cx, bodyY);
      
      // Shoulder armor curve
      ctx.beginPath();
      // Left arm and shoulder pad
      ctx.moveTo(-110, 80);
      ctx.quadraticCurveTo(-115, -15, -60, -10);
      // Collar contour
      ctx.lineTo(-24, -20);
      ctx.quadraticCurveTo(0, -8, 24, -20);
      // Right arm and shoulder pad
      ctx.lineTo(60, -10);
      ctx.quadraticCurveTo(115, -15, 110, 80);
      ctx.closePath();
      
      // Charcoal futuristic composite suit color
      const outfitGrad = ctx.createLinearGradient(-100, 0, 100, 0);
      outfitGrad.addColorStop(0, "#121217");
      outfitGrad.addColorStop(0.5, "#25252f");
      outfitGrad.addColorStop(1, "#0d0d11");
      ctx.fillStyle = outfitGrad;
      ctx.fill();

      // Neon LED Glowing Trim lines
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      // Collar lining
      ctx.moveTo(-50, -13);
      ctx.quadraticCurveTo(0, 2, 50, -13);
      ctx.stroke();

      // Curved armor glowing accents
      ctx.beginPath();
      ctx.moveTo(-95, 30);
      ctx.quadraticCurveTo(-65, -5, -45, 5);
      ctx.moveTo(95, 30);
      ctx.quadraticCurveTo(65, -5, 45, 5);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Center glowing holographic emblem
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = neonColor;
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(10, 25);
      ctx.lineTo(0, 35);
      ctx.lineTo(-10, 25);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.restore();

      // --- Head & Face Placement ---
      const hy = cy + breathingHead + state.headY;
      ctx.save();
      ctx.translate(cx, hy);
      ctx.rotate(state.headRot);

      // Back Hair (Peeking behind ears and shoulders)
      ctx.fillStyle = "#111116";
      ctx.beginPath();
      ctx.moveTo(-75, 40);
      ctx.lineTo(75, 40);
      ctx.lineTo(95, 120);
      ctx.quadraticCurveTo(0, 130, -95, 120);
      ctx.closePath();
      ctx.fill();

      // Sleek neon highlights underhair
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-75, 45);
      ctx.quadraticCurveTo(-90, 80, -85, 120);
      ctx.moveTo(75, 45);
      ctx.quadraticCurveTo(90, 80, 85, 120);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Realistic Face Shape (Elegant chin & jawline 19-23 age look)
      const faceGrad = ctx.createRadialGradient(0, -15, 5, 0, 10, 75);
      faceGrad.addColorStop(0, "#fee9db"); // soft skin
      faceGrad.addColorStop(0.7, "#faedd7");
      faceGrad.addColorStop(1, "#ebd1ba"); // soft shadows
      ctx.fillStyle = faceGrad;
      
      ctx.beginPath();
      ctx.moveTo(-54, -30);
      ctx.bezierCurveTo(-54, -75, 54, -75, 54, -30); // Crown shape
      ctx.bezierCurveTo(54, 2, 45, 23, 0, 48); // Right chin curve
      ctx.bezierCurveTo(-45, 23, -54, 2, -54, -30); // Left chin curve
      ctx.closePath();
      ctx.fill();

      // Cheeks Blush
      ctx.fillStyle = "rgba(242, 138, 151, 0.15)";
      ctx.beginPath();
      ctx.arc(-30, 2, 12, 0, Math.PI * 2);
      ctx.arc(30, 2, 12, 0, Math.PI * 2);
      ctx.fill();

      // --- EYES (Left and Right) ---
      const drawEye = (ex: number, eyeOpen: number) => {
        ctx.save();
        ctx.translate(ex, -12);

        // Eyebrows
        ctx.strokeStyle = "#251b14";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (emotion === "sad") {
          // Eyebrows slanted up
          ctx.moveTo(-16, -11 + state.eyebrowY + 1.5);
          ctx.quadraticCurveTo(0, -14 + state.eyebrowY, 14, -8 + state.eyebrowY);
        } else if (emotion === "surprised") {
          // High raised arch
          ctx.moveTo(-15, -16 + state.eyebrowY);
          ctx.quadraticCurveTo(0, -22 + state.eyebrowY, 15, -16 + state.eyebrowY);
        } else if (emotion === "happy") {
          // Gently curved happy arcs
          ctx.moveTo(-14, -13 + state.eyebrowY);
          ctx.quadraticCurveTo(0, -17 + state.eyebrowY, 14, -13 + state.eyebrowY);
        } else {
          // Natural standard curve
          ctx.moveTo(-15, -12 + state.eyebrowY);
          ctx.quadraticCurveTo(0, -16 + state.eyebrowY, 15, -12 + state.eyebrowY);
        }
        ctx.stroke();

        // Eye Socket Mask when closed
        if (eyeOpen < 0.15) {
          ctx.strokeStyle = "#402015";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-12, -2);
          ctx.quadraticCurveTo(0, 1.5, 12, -2); // happy squint arc
          ctx.stroke();
          ctx.restore();
          return;
        }

        // Sclera (White background)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, -1, 13, 7.5 * eyeOpen, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris (Beautiful Expressive Brown Eyes)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, -1, 13, 7.5 * eyeOpen, 0, 0, Math.PI * 2);
        ctx.clip(); // Keep iris bound inside white

        const irisGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
        irisGrad.addColorStop(0, "#1c0d02");
        irisGrad.addColorStop(0.6, "#543310");
        irisGrad.addColorStop(1, "#261304");
        ctx.fillStyle = irisGrad;
        
        ctx.beginPath();
        // Eye gaze adjustments based on active state
        let gazeX = 0;
        let gazeY = 0;
        if (emotion === "thinking") {
          gazeX = -2.5;
          gazeY = -3 * eyeOpen;
        } else if (emotion === "listening" || emotion === "explaining") {
          gazeY = 0.5 * eyeOpen;
        }
        ctx.arc(gazeX, gazeY, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Pupil (Deep Center Black)
        ctx.fillStyle = "#0c0804";
        ctx.beginPath();
        ctx.arc(gazeX, gazeY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight reflection (Sparkle of life)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(gazeX - 2, gazeY - 2 * eyeOpen, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gazeX + 1.5, gazeY + 1.5 * eyeOpen, 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Eyelid line
        ctx.strokeStyle = "#251307";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -1, 13.2, 7.7 * eyeOpen, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      };

      drawEye(-24, state.eyeOpenL);
      drawEye(24, state.eyeOpenR);

      // --- NOSE ---
      ctx.strokeStyle = "#dfb491";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-1.5, 1);
      ctx.lineTo(0, 15);
      ctx.quadraticCurveTo(2.5, 17, 3, 15.5);
      ctx.stroke();

      // --- MOUTH / LIPS ---
      ctx.save();
      ctx.translate(0, 26);

      // Render mouth state details
      const mouthWidth = 24 + (state.mouthSmile * 4);
      const mouthHeight = Math.max(1.5, state.mouthOpen * 16);

      if (state.mouthSmile > 0.8 && state.mouthOpen < 0.15) {
        // Closed warm smile
        ctx.strokeStyle = "#af2a3b";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-mouthWidth/1.8, -1.5);
        ctx.quadraticCurveTo(0, 3.5, mouthWidth/1.8, -1.5);
        ctx.stroke();
        
        // Smiling lip edges
        ctx.fillStyle = "#ce4054";
        ctx.beginPath();
        ctx.arc(-mouthWidth/1.8, -1.5, 1.2, 0, Math.PI * 2);
        ctx.arc(mouthWidth/1.8, -1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Open/Speaking lipsyncing shape
        // Lips Shadow Back
        ctx.fillStyle = "#630b1c";
        ctx.beginPath();
        ctx.ellipse(0, 0, mouthWidth / 1.7, mouthHeight / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Teeth (White strip visible on larger mouth openings)
        if (mouthHeight > 4.5) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.rect(-mouthWidth / 3, -mouthHeight / 2.5, (mouthWidth / 3) * 2, mouthHeight / 3);
          ctx.fill();
        }

        // Lipstick outlines
        ctx.fillStyle = "#e2546b"; // beautiful soft red-pinkish tint
        // Top Lip
        ctx.beginPath();
        ctx.moveTo(-mouthWidth / 1.8, 0);
        ctx.quadraticCurveTo(-mouthWidth / 3.6, -3 - mouthHeight/3, 0, -1 - mouthHeight/4);
        ctx.quadraticCurveTo(mouthWidth / 3.6, -3 - mouthHeight/3, mouthWidth / 1.8, 0);
        ctx.quadraticCurveTo(0, 0, -mouthWidth / 1.8, 0);
        ctx.closePath();
        ctx.fill();

        // Bottom Lip
        ctx.fillStyle = "#b53549";
        ctx.beginPath();
        ctx.moveTo(-mouthWidth / 1.8, 0);
        ctx.quadraticCurveTo(0, 2.5 + mouthHeight, mouthWidth / 1.8, 0);
        ctx.quadraticCurveTo(0, 0.5, -mouthWidth / 1.8, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // --- FOREHEAD FRINGE & FRAMING HAIR (The Cyber highlights!) ---
      ctx.save();
      // Side hair sweeps, with blue highlights
      ctx.fillStyle = "#0c0a0f"; // sleek midnight black
      
      // Left side locks
      ctx.beginPath();
      ctx.moveTo(-52, -65);
      ctx.quadraticCurveTo(-75, -20, -70, 35);
      ctx.quadraticCurveTo(-50, -10, -42, -35);
      ctx.closePath();
      ctx.fill();

      // Colored streak left
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 3.0;
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-50, -50);
      ctx.quadraticCurveTo(-72, -15 + state.swayHair, -68, 40);
      ctx.stroke();

      // Right side locks
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0c0a0f";
      ctx.beginPath();
      ctx.moveTo(52, -65);
      ctx.quadraticCurveTo(75, -20, 70, 35);
      ctx.quadraticCurveTo(50, -10, 42, -35);
      ctx.closePath();
      ctx.fill();

      // Colored streak right
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 3.0;
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(50, -50);
      ctx.quadraticCurveTo(72, -15 - state.swayHair, 78, 40);
      ctx.stroke();

      // Forehead bangs / fringe sweeps
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#19151e";
      ctx.beginPath();
      ctx.moveTo(-55, -60);
      ctx.quadraticCurveTo(-15, -75, 45, -64);
      ctx.quadraticCurveTo(15, -44, 28, -28); // sweep right bang
      ctx.quadraticCurveTo(-5, -50, -25, -34); // center bang
      ctx.quadraticCurveTo(-45, -45, -55, -60);
      ctx.closePath();
      ctx.fill();

      // Sparkle Highlights on bangs
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-35, -65);
      ctx.quadraticCurveTo(-15, -68, 15, -61);
      ctx.stroke();

      ctx.restore();

      ctx.restore(); // Restore body rotate/translate

      // --- Futuristic Cinematic Scanner Lines or Digital Particles ---
      ctx.save();
      // Simple particle dust floating upwards
      const particleTime = time * 0.0003;
      for (let i = 0; i < 12; i++) {
        const px = cx + Math.sin(particleTime + i * 20) * (140 + i * 10);
        // drift up repeating
        const startY = cy + 180;
        const driftY = ((startY - (i * 35) - (time * 0.05) % 360) + 360) % 360;
        const py = cy - 180 + driftY;
        const radius = 1.0 + (i % 3) * 0.8;
        
        ctx.fillStyle = neonColor;
        ctx.globalAlpha = Math.max(0, 1 - (startY - py) / 360) * 0.7;
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [emotion, isSpeaking, neonColor, voiceActivity]);

  return (
    <div id="zoya_mesh_viewport" className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Cinematic grid target overlays */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-cyan-400/50 flex flex-col gap-1 select-none pointer-events-none">
        <div>MODEL: ZOYA_V3.8</div>
        <div>RIG: REALISTIC_FACIAL_RIG_v2</div>
        <div>RENDER: WEBGL_2.5D_SHADED</div>
      </div>
      <div className="absolute top-4 right-4 font-mono text-[9px] text-purple-400/50 flex flex-col items-end gap-1 select-none pointer-events-none">
        <div>DYN_SYNC: ACTIVE</div>
        <div>HIGHLIGHTS_FPS: 60</div>
        <div>SYS_TEMP: 34.2°C</div>
      </div>

      <canvas
        ref={canvasRef}
        id="zoya_hyper_canvas"
        className="block relative pointer-events-none transition-transform duration-500 hover:scale-105"
      />

      {/* Hologram Chamber Shadow ring layer */}
      <div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[220px] h-4 rounded-full blur-[6px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, ${neonColor}33 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
