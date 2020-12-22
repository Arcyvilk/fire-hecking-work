import React, { useState } from "react";
import styled from "styled-components";
import BadProjectile from "./BadProjectile";
import GoodProjectile from "./GoodProjectile";

const StyledApp = styled.div`
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function App() {
  const [experimental, setExperimental] = useState(true);
  return (
    <StyledApp className="App">
      {/* <button onClick={() => setExperimental(!experimental)}>
      {experimental ? 'Back to normal' : 'Go to Canvas experiment'}
      </button> */}
      {experimental ? <GoodProjectile /> : <BadProjectile />}
    </StyledApp>
  );
}
