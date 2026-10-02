import React from "react";
import { Link } from "react-router-dom";
import { styled } from "styled-components";
import Sponsordata from "../Data/SponsorData.json";
import { optimizedVariantName } from "../utils/optimizedAsset";

const Container = styled.div`
  background-color: black;
  display: flex;
  flex-direction: column;
  padding: 4rem 1rem 5rem;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin: auto;
  padding: 1.5rem 2rem 0;
`;

const Card = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Image = styled.img`
  max-width: 360px;
  max-height: 280px;
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    max-width: 220px;
    max-height: 180px;
  }

`;

export default function SponsorCard() {
    return (
      <section id="sponsor-section"> {}
        <Container>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.1em] text-center text-white mb-8 md:mb-12 uppercase"
            style={{ fontFamily: "Bungee, sans-serif" }}
          >
            Sponsor
          </h2>
          <CardWrapper>
            {Sponsordata.filter(item => !item._example).map((item, index) => (
              <Link key={index} to={item.path} target="_blank" rel="noopener noreferrer">
                <Card>
                  <Image 
                    src={require("../AssetsOptimized/Sponsor/" + optimizedVariantName(item.img, "lg"))}
                    srcSet={`${require("../AssetsOptimized/Sponsor/" + optimizedVariantName(item.img, "sm"))} 360w, ${require("../AssetsOptimized/Sponsor/" + optimizedVariantName(item.img, "lg"))} 720w`}
                    sizes="(max-width: 768px) 220px, 360px"
                    alt={item.name}
                    className="rounded-md"
                    loading="lazy"
                    decoding="async"
                    width="720"
                    height="480"
                  />
                </Card>
              </Link>
            ))}
          </CardWrapper>
        </Container>
      </section>
    );
  }
