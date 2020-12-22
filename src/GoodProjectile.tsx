import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const width: number = 500;
const height: number = 500;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

type CanvasProps = {
  draw: any;
  onClick: (event: any) => void;
};
export function Canvas(props: CanvasProps) {
  const { draw, onClick } = props;
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState();
  const [ctx, setCtx] = useState();

  useEffect(() => {
    const c = canvasRef.current;
    const context = c.getContext("2d");
    setCanvas(c);
    setCtx(context);
    let animationFrameId = null;

    const render = () => {
      draw(ctx);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, ctx]);

  const onReset = () =>
    ctx && ctx?.clearRect(0, 0, ctx?.canvas?.height, ctx?.canvas?.width);

  return (
    <Wrapper>
      <button onClick={onReset}>Reset</button>
      <canvas
        ref={canvasRef}
        {...props}
        width={width}
        height={height}
        onClick={onClick}
        style={{ border: "1px solid #000" }}
      />
    </Wrapper>
  );
}

export default function GoodProjectile() {
  let x: number = width / 2;
  let y: number = height;
  const timeToFinish: number = 1000; // seconds
  const interval: number = 10;
  const nrOfProjectiles: number = 30;
  const rockets: number[] = [...Array(nrOfProjectiles)];

  // state
  const [moving, setMoving] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [color, setColor] = useState("#ffeeee");
  const [rocketCords, setRocketCords] = useState([]);
  const [cords, setCords] = useState({ x: 0, y: 0 } as {
    x: number;
    y: number;
  });

  // --------------------------
  // explosion
  // --------------------------
  const triangleArms = (index: number, tick: number) => {
    const degrees = index * (360 / nrOfProjectiles);
    const radians: number = degrees * (Math.PI / 180);
    const tangens: number = Math.tan(radians);
    const longArm: number = 15 - tick; // przeciwprostokątna, ruch jednostajnie spowolniony
    const armX: number = longArm / Math.sqrt(tangens * tangens + 1);
    const armY: number = tangens * armX;
    return [armX, armY];
  };

  const onExplode = (p: number, q: number) => {
    if (exploded) return;
    console.log("exploding");
    const initialRockets = rockets.map((rocket, index) => [p, height - q]);
    setCords({
      x: p,
      y: height - q
    });
    setRocketCords(initialRockets);

    const moveRockets = (tick: number, previousRockets) => {
      if (tick === 0) previousRockets = initialRockets;
      const newRockets = previousRockets.map((rocket, index) => {
        const [plusX, plusY] = triangleArms(index, tick);
        return index >= previousRockets.length / 2
          ? [rocket[0] - plusX, rocket[1] - plusY]
          : [rocket[0] + plusX, rocket[1] + plusY];
      });
      console.log(newRockets);
      setRocketCords(newRockets);
      if (tick >= 15) {
        console.log("end");
        setExploded(false);
        return;
      }
      setTimeout(() => moveRockets(tick + 1, newRockets), 20);
    };
    moveRockets(0, []);
    setExploded(true);
  };

  const drawExplosion = (ctx) => {
    if (ctx && rocketCords && rocketCords.length) {
      ctx.clearRect(0, 0, ctx.canvas.height, ctx.canvas.width);
      for (let i = 0; i < rocketCords.length; i++) {
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(rocketCords[i][0], rocketCords[i][1], 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  // --------------------------
  // initial trajectory
  // --------------------------
  const move = (p: number, q: number, xt: number, a: number, t: number) => {
    if (t >= timeToFinish) {
      setMoving(false);
      onExplode(p, q);
      return;
    }
    x = p > x ? x + xt : x - xt;
    y = height - (q + a * (x - p) * (x - p));
    setCords({ x, y });
    setColor("#ff0000");
    setTimeout(() => move(p, q, xt, a, t + interval), interval);
  };

  const onStartTrajectory = (event) => {
    if (moving) return;
    const t = 0;
    const p = event.nativeEvent.offsetX;
    const q = height - event.nativeEvent.offsetY;
    const a = (-1 * q) / ((width / 2 - p) * (width / 2 - p));
    const xt = Math.abs(width / 2 - p) / (timeToFinish / interval);
    setMoving(true);
    move(p, q, xt, a, t);
  };

  const drawMissile = (ctx) => {
    if (ctx) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cords.x, cords.y, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const onDraw = (ctx) => {
    if (!ctx) return;
    return !exploded ? drawMissile(ctx) : drawExplosion(ctx);
  };

  // --------------------------
  // component itself
  // --------------------------
  return <Canvas draw={onDraw} onClick={onStartTrajectory} />;
}
