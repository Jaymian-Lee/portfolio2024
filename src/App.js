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

        html, body {
          overflow: hidden;
        }

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
          stroke-width: 1;
          position: fixed;
          z-index: 2;
        }
        .icon2 {
          width: 40px;
          height: 40px;
          fill: none;
          position: fixed;
          z-index: 2;
        }
        .github-icon {
          left: 20px;
          top: 20px;
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
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px 10px;
          font-size: 1.5vw;
          font-weight: 700;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 2px;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.3),
            0 0 20px rgba(255, 255, 255, 0.2);
          transition: transform 0.1s ease;
        }
        @media (max-width: 1268px) {
          .contact-button {
            font-size: 3vw;
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
        <a href="https://github.com/Jaymian-Lee" target="_blank" rel="noopener noreferrer">
        <svg height="32" viewBox="0 0 16 16" className="icon2 github-icon" version="1.1" width="32" aria-hidden="true">
  <path fill="#FFFFFF" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.003 8.003 0 0016 8c0-4.42-3.58-8-8-8z"></path>
</svg>

        </a>
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
