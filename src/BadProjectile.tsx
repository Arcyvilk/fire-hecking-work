import React, { useState } from "react";
import styled from "styled-components";

const width: number = 500;
const height: number = 500;

const Container = styled.div`
  width: ${width}px;
  height: ${height}px;
  box-sizing: border-box;
  display: flex;
  border: 1px solid black;
  position: relative;
`;

type ProjectileProps = {
  position: {
    x: number;
    y: number;
  };
};
const Projectile = styled.div.attrs(({ position }: ProjectileProps) => {
  return {
    style: {
      left: position.x,
      bottom: position.y
    }
  };
})<ProjectileProps>`
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 5px;
`;
const StyledProjectile = styled(Projectile)`
  background-color: red;
`;
const Rocket = styled(Projectile)`
  background-color: green;
`;

export default function BadProjectile() {
  let x: number = width / 2;
  let y: number = 0;
  const [moving, setMoving] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [cords, setCords] = useState({ x: 0, y: 0 } as {
    x: number;
    y: number;
  });
  const [rocketCords, setRocketCords] = useState([]);

  const timeToFinish: number = 1000; // seconds
  const interval: number = 10;
  const nrOfProjectiles: number = 10;
  const rockets: number[] = [...Array(nrOfProjectiles)];

  const triangleArms = (index: number) => {
    const radians: number = (Math.PI * index * (360 / nrOfProjectiles)) / 180;
    const tangens: number = Math.tan(radians);
    const longArm: number = 10; // przeciwprostokątna
    const armX: number = longArm / Math.sqrt(tangens * tangens + 1);
    const armY: number = tangens * armX;
    return [armX, armY];
  };

  const explode = () => {
    const moveRockets = (tick: number) => {
      const newRockets = rockets.map((rocket, index) => {
        const [armX, armY] = triangleArms(index);
        console.log([armX, armY]);
        return [armX, armY];
      });
      setRocketCords(newRockets);
      setTimeout(() => moveRockets(tick + 1), 10);
    };
    moveRockets(0);
    setExploded(true);
  };
  const move = (p: number, q: number, a: number, t: number) => {
    if (t >= timeToFinish) {
      setMoving(false);
      explode();
      return;
    }
    const xt = Math.abs(width / 2 - p) / (timeToFinish / interval);
    x = p > x ? x + xt : x - xt;
    y = q + a * (x - p) * (x - p);
    setCords({ x, y });
    setTimeout(() => move(p, q, a, t + interval), interval);
  };

  const onStartTrajectory = (event) => {
    if (moving) return;
    const t = 0;
    const p = event.nativeEvent.offsetX;
    const q = height - event.nativeEvent.offsetY;
    const a = (-1 * q) / ((width / 2 - p) * (width / 2 - p));
    setExploded(false);
    setMoving(true);
    move(p, q, a, t);
  };

  const onReset = () => {
    x = width / 2;
    y = 0;
    setCords({ x, y });
    setMoving(false);
    setExploded(false);
  };

  return (
    <>
      <button onClick={onReset}>Reset</button>
      <div>
        <p>
          [x, y]: [{cords.x}, {cords.y}]
        </p>
      </div>
      <Container onClick={onStartTrajectory}>
        {!exploded && (
          <StyledProjectile position={{ x: cords.x, y: cords.y }} />
        )}
        {exploded &&
          rockets.map((rocket, index) => (
            <Rocket
              position={{
                x: rocketCords?.[index]?.x || 0,
                y: rocketCords?.[index]?.y || 0
              }}
            />
          ))}
      </Container>
    </>
  );
}
