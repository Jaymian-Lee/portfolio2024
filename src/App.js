import React, { useState, useEffect, useRef } from 'react';

const Portfolio = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const nameRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (nameRef.current) {
        const rect = nameRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angleX = -(e.clientY - centerY) / 50;
        const angleY = (e.clientX - centerX) / 50;
        nameRef.current.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="portfolio">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700&family=Roboto+Slab:wght@300;400;700&family=Montserrat:wght@300;400;700&display=swap');

        .portfolio {
          color: white;
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
          font-family: 'Raleway', sans-serif;
          background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
          position: relative;
        }
        .section {
          min-height: 100vh;
          padding: 20px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .name-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .stylized-name {
          font-size: 8vw;
          font-weight: 700;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 4px;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.3),
            0 0 20px rgba(255, 255, 255, 0.2);
          transition: transform 0.1s ease;
        }
        .slogan {
          font-size: 2vw;
          margin-top: 20px;
          font-weight: 300;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.7);
        }
        .moving-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at var(--x) var(--y), rgba(100, 149, 237, 0.1) 0%, rgba(0,0,0,0) 50%);
          pointer-events: none;
          z-index: 1;
        }
        .icon {
          width: 40px;
          height: 40px;
          fill: none;
          stroke: white;
          stroke-width: 2;
          position: fixed;
          z-index: 2;
        }
        .linkedin-icon {
          right: 20px;
          bottom: 20px;
        }
        .instagram-icon {
          left: 20px;
          bottom: 20px;
        }
        .contact-button {
          position: fixed;
          top: 20px;
          right: 20px;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 1px;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.3),
            0 0 20px rgba(255, 255, 255, 0.2);
          transition: transform 0.1s ease;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        @media (max-width: 600px) {
          .stylized-name {
            font-size: 12vw;
          }
          .slogan {
            font-size: 4vw;
          }
          .contact-button {
            font-size: 12px;
            padding: 3px 7px;
          }
          .icon {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>

      <div 
        className="moving-bg" 
        style={{ '--x': `${mousePosition.x}px`, '--y': `${mousePosition.y}px` }}
      ></div>

      <section id="home" className="section">
        <div className="name-container">
          <div className="stylized-name" ref={nameRef}>
            JAYMIAN-LEE
          </div>
          <div className="slogan">Developing the future</div>
        </div>
        <button
          className="contact-button"
          onClick={() => window.location.href = 'mailto:info@jaymian-lee.nl'}
        >
          Contact Me
        </button>
        <a href="https://www.linkedin.com/in/jaymian-lee-reinartz-9b02941b0/" target="_blank" rel="noopener noreferrer">
          <svg className="icon linkedin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 10-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2V9zm2-7a2 2 0 110 4 2 2 0 010-4z"/>
          </svg>
        </a>
        <a href="https://www.instagram.com/jaymianlee/" target="_blank" rel="noopener noreferrer">
          <svg className="icon instagram-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5a4.25 4.25 0 00-4.25-4.25h-8.5zM12 7.75a4.25 4.25 0 110 8.5 4.25 4.25 0 010-8.5zm0 1.5a2.75 2.75 0 100 5.5 2.75 2.75 0 000-5.5zM17 6.25a.875.875 0 110 1.75.875.875 0 010-1.75z"/>
          </svg>
        </a>
      </section>
    </div>
  );
};

export default Portfolio;
