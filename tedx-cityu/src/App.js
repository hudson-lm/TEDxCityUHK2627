import React, { Suspense, lazy, useState, useEffect } from "react";
import styled from "styled-components";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; // Tambah useLocation
import Navbar from "./Components/navbar";
import Footer from "./Components/footer";

const HomePage = lazy(() => import("./Pages/homepage"));
const AboutTedx = lazy(() => import("./Components/aboutTedx"));
const TeamPage = lazy(() => import("./Pages/teampage"));
const PastEventPage = lazy(() => import("./Pages/pasteventpage"));
const RegistrationPage = lazy(() => import("./Pages/registrationpage"));
const CommitteeRegistrationPage = lazy(() => import("./Pages/committeeRegistrationPage"));
const SpeakerPage = lazy(() => import("./Pages/Speakerpage"));

const Container = styled.div`
  overflow-x: hidden;
`;

const RouteLoading = styled.div`
  min-height: 55vh;
  display: grid;
  place-items: center;
  color: #8e1730;
  background: #f7f2e9;
  font: 700 0.75rem 'Commissioner', sans-serif;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;

function AppContent() {
  const location = useLocation();
  const mobileBreakpoint = 768;
  const tabletBreakpoint = 1024;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < mobileBreakpoint;
  const isTablet = windowWidth >= mobileBreakpoint && windowWidth < tabletBreakpoint;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAboutPage = location.pathname === '/about';

  return (
    <Container>
      {isMobile ? <Navbar /> : isTablet ? <Navbar /> : <Navbar />}
      <Suspense fallback={<RouteLoading>Preparing the stage…</RouteLoading>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutTedx show={true} />} />
          <Route path="/crew" element={<TeamPage isMobile={isMobile} isTablet={isTablet} />} />
          <Route path="/pastevent" element={<PastEventPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/committee-registration" element={<CommitteeRegistrationPage />} />
          <Route path="/speaker/:path" element={<SpeakerPage />} />
        </Routes>
      </Suspense>
      {!isAboutPage && <Footer />}
    </Container>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
