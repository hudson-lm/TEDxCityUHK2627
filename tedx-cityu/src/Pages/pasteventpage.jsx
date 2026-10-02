import { styled } from "styled-components";
import tile01Small from "../AssetsOptimized/PastEvents/TEDx Website Design-01-sm.webp";
import tile01Large from "../AssetsOptimized/PastEvents/TEDx Website Design-01-lg.webp";
import tile02Small from "../AssetsOptimized/PastEvents/TEDx Website Design-02-sm.webp";
import tile02Large from "../AssetsOptimized/PastEvents/TEDx Website Design-02-lg.webp";
import tile03Small from "../AssetsOptimized/PastEvents/TEDx Website Design-03-sm.webp";
import tile03Large from "../AssetsOptimized/PastEvents/TEDx Website Design-03-lg.webp";
import tile04Small from "../AssetsOptimized/PastEvents/TEDx Website Design-04-sm.webp";
import tile04Large from "../AssetsOptimized/PastEvents/TEDx Website Design-04-lg.webp";
import tile05Small from "../AssetsOptimized/PastEvents/TEDx Website Design-05-sm.webp";
import tile05Large from "../AssetsOptimized/PastEvents/TEDx Website Design-05-lg.webp";
import tile06Small from "../AssetsOptimized/PastEvents/TEDx Website Design-06-sm.webp";
import tile06Large from "../AssetsOptimized/PastEvents/TEDx Website Design-06-lg.webp";

const eventTiles = [
  [tile01Small, tile01Large, 2000],
  [tile02Small, tile02Large, 2000],
  [tile03Small, tile03Large, 2000],
  [tile04Small, tile04Large, 2000],
  [tile05Small, tile05Large, 2000],
  [tile06Small, tile06Large, 1869],
];

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const Image = styled.img`
  width: 100%;
  max-width: 1600px;
  height: auto;
`;

export default function PastEventPage() {
  return (
    <Container>
      {eventTiles.map(([small, large, height], index) => (
        <Image
          key={large}
          src={large}
          srcSet={`${small} 720w, ${large} 1600w`}
          sizes="(max-width: 1600px) 100vw, 1600px"
          alt={index === 0 ? "TEDx Past Events" : ""}
          decoding="async"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          width="1600"
          height={height}
        />
      ))}
    </Container>
  );
}
