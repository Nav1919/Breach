"use client";

import { useEffect, useRef, useState } from "react";
import Script from 'next/script';

// Declare particlesJS on the window object
declare global {
  interface Window {
    particlesJS: any;
    pJSDom: any[];
  }
}

export default function ParticlesBackground() {
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to initialize the creation hands particles
  const initHandsParticles = () => {
    if (typeof window !== 'undefined' && window.particlesJS && particlesContainerRef.current) {
      console.log("Initializing Creation of Adam hands particles");
      
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 1200,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ["#ffffff", "#f9f9f9", "#f0f0f0"]
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000"
            }
          },
          opacity: {
            value: 0.7,
            random: true,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 2.5,
            random: true,
            anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: false,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 1.5,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
              enable: true,
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
              distance: 400,
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
              duration: 0.4
            },
            push: {
              particles_nb: 4
            },
            remove: {
              particles_nb: 2
            }
          }
        },
        retina_detect: true,
        fn: {
          particlesCreate: () => {
            console.log("Particles created");
          },
          particlesUpdate: () => {
            console.log("Particles updated");
          }
        }
      });
      
      // After initialization, arrange particles into hand shapes
      arrangeParticlesIntoHands();
      setIsInitialized(true);
    } else {
      console.log("particlesJS not available yet");
    }
  };
  
  // Function to arrange particles into hand shapes
  const arrangeParticlesIntoHands = () => {
    if (window.pJSDom && window.pJSDom.length > 0) {
      const pJS = window.pJSDom[0].pJS;
      if (!pJS || !pJS.particles || !pJS.particles.array) {
        console.log("Particles array not found");
        return;
      }
      
      const particles = pJS.particles.array;
      const canvas = pJS.canvas.el;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Hand shapes data points - approximate coordinates for Creation of Adam hands
      // Left hand (Adam)
      const leftHandPoints = [
        // Central area of left hand
        { x: centerX - 100, y: centerY - 10 },
        { x: centerX - 110, y: centerY - 5 },
        { x: centerX - 120, y: centerY - 0 },
        { x: centerX - 125, y: centerY + 5 },
        // Index finger
        { x: centerX - 80, y: centerY - 25 },
        { x: centerX - 70, y: centerY - 30 },
        { x: centerX - 60, y: centerY - 32 },
        // Middle finger
        { x: centerX - 90, y: centerY - 15 },
        { x: centerX - 85, y: centerY - 20 },
        { x: centerX - 80, y: centerY - 22 },
        // Thumb
        { x: centerX - 130, y: centerY + 20 },
        { x: centerX - 125, y: centerY + 30 },
        { x: centerX - 120, y: centerY + 35 },
        // Other fingers (ring finger)
        { x: centerX - 100, y: centerY - 5 },
        { x: centerX - 95, y: centerY - 10 },
        { x: centerX - 90, y: centerY - 12 },
        // Pinky
        { x: centerX - 110, y: centerY + 0 },
        { x: centerX - 105, y: centerY - 5 },
        { x: centerX - 100, y: centerY - 7 },
        // Wrist area
        { x: centerX - 150, y: centerY + 10 },
        { x: centerX - 155, y: centerY + 5 },
        { x: centerX - 160, y: centerY + 0 },
        // Arm
        { x: centerX - 170, y: centerY - 5 },
        { x: centerX - 180, y: centerY - 10 },
        { x: centerX - 190, y: centerY - 15 },
      ];
      
      // Right hand (God)
      const rightHandPoints = [
        // Central area of right hand
        { x: centerX + 100, y: centerY - 10 },
        { x: centerX + 110, y: centerY - 5 },
        { x: centerX + 120, y: centerY - 0 },
        { x: centerX + 125, y: centerY + 5 },
        // Index finger pointing (the famous touching point)
        { x: centerX + 80, y: centerY - 25 },
        { x: centerX + 70, y: centerY - 30 },
        { x: centerX + 60, y: centerY - 32 },
        // The touching point (most important)
        { x: centerX + 45, y: centerY - 33 },
        // God's arm
        { x: centerX + 170, y: centerY - 5 },
        { x: centerX + 180, y: centerY - 10 },
        { x: centerX + 190, y: centerY - 15 },
        { x: centerX + 200, y: centerY - 20 },
        // Thumb
        { x: centerX + 130, y: centerY + 20 },
        { x: centerX + 125, y: centerY + 30 },
        { x: centerX + 120, y: centerY + 35 },
        // Other fingers
        { x: centerX + 100, y: centerY - 5 },
        { x: centerX + 90, y: centerY - 10 },
        { x: centerX + 80, y: centerY - 15 },
        // Wrist area
        { x: centerX + 150, y: centerY + 10 },
        { x: centerX + 155, y: centerY + 5 },
        { x: centerX + 160, y: centerY + 0 },
      ];
      
      // Combine both hands
      const handPoints = [...leftHandPoints, ...rightHandPoints];
      
      // Calculate how many particles we'll use per point
      const particlesPerPoint = Math.floor(particles.length / handPoints.length);
      
      // Distribute particles to form hands
      let particleIndex = 0;
      
      handPoints.forEach((point) => {
        for (let i = 0; i < particlesPerPoint && particleIndex < particles.length; i++) {
          // Distribute particles within a small radius around each point
          const radius = 10;
          const angle = Math.random() * Math.PI * 2;
          const distanceFromCenter = Math.pow(Math.random(), 2) * radius;
          
          const particle = particles[particleIndex];
          
          // Set position
          particle.x = point.x + distanceFromCenter * Math.cos(angle);
          particle.y = point.y + distanceFromCenter * Math.sin(angle);
          
          // Store original position for reformation
          particle.original_x = particle.x;
          particle.original_y = particle.y;
          
          // Slow down movement
          particle.vx = 0;
          particle.vy = 0;
          
          particleIndex++;
        }
      });
      
      // Set the remaining particles randomly if any
      for (let i = particleIndex; i < particles.length; i++) {
        particles[i].x = Math.random() * width;
        particles[i].y = Math.random() * height;
        particles[i].original_x = particles[i].x;
        particles[i].original_y = particles[i].y;
      }
      
      // Add custom behavior to make particles return to their original position
      const originalUpdate = pJS.fn.particlesDraw;
      pJS.fn.particlesDraw = function() {
        // Call the original update function
        originalUpdate.call(this);
        
        // Add custom logic to make particles return to original position when not disrupted
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // If the particle has original coordinates and is not being interacted with
          if (particle.original_x !== undefined && particle.original_y !== undefined) {
            // Gradually return to original position
            const dx = particle.original_x - particle.x;
            const dy = particle.original_y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only move if the particle is far enough from its original position
            if (distance > 5) {
              // Adjust velocity to move back toward original position
              particle.vx += dx * 0.02;
              particle.vy += dy * 0.02;
              
              // Dampen velocity to prevent oscillation
              particle.vx *= 0.92;
              particle.vy *= 0.92;
            } else {
              // Once close enough, reset velocity
              particle.vx *= 0.7;
              particle.vy *= 0.7;
            }
          }
        }
      };
    }
  };

  // Monitor for user interaction and trigger reformation
  const setupReformationBehavior = () => {
    if (window.pJSDom && window.pJSDom.length > 0) {
      const pJS = window.pJSDom[0].pJS;
      const canvas = pJS.canvas.el;
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Add event listeners to detect user interaction
      canvas.addEventListener('mousemove', () => {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set timeout to trigger reformation after user stops interacting
        timeoutRef.current = setTimeout(() => {
          console.log("Reforming particles into hands...");
          arrangeParticlesIntoHands();
        }, 2000); // Reduced from 3000 to 2000 ms for faster reformation
      });
      
      // Also handle touch events for mobile
      canvas.addEventListener('touchmove', () => {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set timeout to trigger reformation after user stops interacting
        timeoutRef.current = setTimeout(() => {
          console.log("Reforming particles into hands...");
          arrangeParticlesIntoHands();
        }, 2000); // Reduced from 3000 to 2000 ms for faster reformation
      });
    }
  };

  useEffect(() => {
    // Try to initialize particles immediately if the script is already loaded
    if (window.particlesJS) {
      console.log("particlesJS already available, initializing");
      initHandsParticles();
      
      // Setup reformation behavior after a slight delay to ensure particles are created
      setTimeout(() => {
        setupReformationBehavior();
      }, 1000);
    } else {
      // If not available yet, poll for it
      const checkParticlesInterval = setInterval(() => {
        if (window.particlesJS) {
          console.log("particlesJS detected during polling, initializing");
          initHandsParticles();
          clearInterval(checkParticlesInterval);
          
          // Setup reformation behavior after a slight delay
          setTimeout(() => {
            setupReformationBehavior();
          }, 1000);
        }
      }, 100);
      
      // Set a timeout to clear the interval if it runs too long
      setTimeout(() => clearInterval(checkParticlesInterval), 5000);
      
      return () => {
        clearInterval(checkParticlesInterval);
        
        // Clean up the timeout on component unmount
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
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
          if (!isInitialized) {
            initHandsParticles();
            
            // Setup reformation behavior after a slight delay
            setTimeout(() => {
              setupReformationBehavior();
            }, 1000);
          }
        }}
      />
      <div 
        id="particles-js" 
        ref={particlesContainerRef}
        className="fixed top-0 left-0 w-full h-screen z-0"
        style={{ 
          backgroundColor: 'transparent',
        }}
      />
    </>
  );
} 