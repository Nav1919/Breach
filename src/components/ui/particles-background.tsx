"use client";

import { useEffect, useRef } from "react";
import Script from 'next/script';

// Declare particlesJS on the window object
declare global {
  interface Window {
    particlesJS: any;
  }
}

export default function ParticlesBackground() {
  const particlesContainerRef = useRef<HTMLDivElement>(null);

  // Function to initialize particles
  const initParticles = () => {
    if (typeof window !== 'undefined' && window.particlesJS && particlesContainerRef.current) {
      console.log("Initializing particles.js");
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 120,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ["#3498db", "#2980b9", "#9b59b6", "#8e44ad"] // Multiple colors for more visual interest
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000"
            },
            polygon: {
              nb_sides: 5
            }
          },
          opacity: {
            value: 0.6,
            random: true, // Random opacity for more dynamic look
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 4,
            random: true,
            anim: {
              enable: true,
              speed: 40,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#34495e",
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 4,
            direction: "none",
            random: true, // Random movement for more natural flow
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
              enable: true, // Enable attraction between particles
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: "window",
          events: {
            onhover: {
              enable: true,
              mode: "repulse"
            },
            onclick: {
              enable: true,
              mode: "push"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 1
              }
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3
            },
            repulse: {
              distance: 200,
              duration: 0.8
            },
            push: {
              particles_nb: 4
            },
            remove: {
              particles_nb: 2
            }
          }
        },
        retina_detect: true
      });
    } else {
      console.log("particlesJS not available yet");
    }
  };

  useEffect(() => {
    // Try to initialize particles immediately if the script is already loaded
    if (window.particlesJS) {
      console.log("particlesJS already available, initializing");
      initParticles();
    } else {
      // If not available yet, poll for it
      const checkParticlesInterval = setInterval(() => {
        if (window.particlesJS) {
          console.log("particlesJS detected during polling, initializing");
          initParticles();
          clearInterval(checkParticlesInterval);
        }
      }, 100);
      
      // Set a timeout to clear the interval if it runs too long
      setTimeout(() => clearInterval(checkParticlesInterval), 5000);
      
      return () => {
        clearInterval(checkParticlesInterval);
      };
    }
  }, []);

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("Particles.js script loaded");
          // Initialize particles after the script has loaded
          initParticles();
        }}
      />
      <div 
        id="particles-js" 
        ref={particlesContainerRef}
        className="fixed top-0 left-0 w-full h-screen z-0"
        style={{ backgroundColor: 'transparent' }}
      />
    </>
  );
} 