import React, { useState, useEffect, useRef } from 'react';

const Portfolio = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const nameRef = useRef(null);
  const workCardsRef = useRef(null);

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

  const handleCardMouseMove = (e) => {
    if (activeCard === null || !workCardsRef.current) return;
    const card = workCardsRef.current.children[activeCard];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const mx = x / rect.width;
    const my = y / rect.height;
    card.style.transform = `rotateY(${mx * 10}deg) rotateX(${-my * 10}deg) translateZ(50px)`;
  };

  const handleCardMouseEnter = (index) => {
    setActiveCard(index);
  };

  const handleCardMouseLeave = () => {
    setActiveCard(null);
    if (workCardsRef.current) {
      Array.from(workCardsRef.current.children).forEach(card => {
        card.style.transform = '';
      });
    }
  };

  const MiniGame = () => {
    const [position, setPosition] = useState(0);
    const maxPosition = 100;

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight' && position < maxPosition) {
          setPosition(prev => Math.min(prev + 10, maxPosition));
        } else if (e.key === 'ArrowLeft' && position > 0) {
          setPosition(prev => Math.max(prev - 10, 0));
        }
        if (position === maxPosition) {
          setGameCompleted(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [position]);

    return (
      <div className="mini-game">
        <div className="game-instructions">Use left and right arrow keys to move the block to the end</div>
        <div className="game-container">
          <div className="game-block" style={{ left: `${position}%` }}></div>
        </div>
      </div>
    );
  };

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
        .work-cards-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 50px;
        }
        .work-card {
          width: 250px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          transition: transform 0.3s ease;
        }
        .work-card:hover {
          transform: translateY(-10px);
        }
        .contact-form {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 400px;
        }
        .contact-form input,
        .contact-form textarea {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
        }
        .contact-form button {
          padding: 10px;
          border-radius: 5px;
          border: none;
          background: #6495ED;
          color: white;
          cursor: pointer;
        }
        .mini-game {
          width: 100%;
          max-width: 400px;
        }
        .game-container {
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          position: relative;
          border-radius: 10px;
        }
        .game-block {
          width: 20px;
          height: 20px;
          background: #6495ED;
          position: absolute;
          border-radius: 50%;
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
      </section>

      <section id="work" className="section">
        <h2>My Work Experience</h2>
        <div 
          className="work-cards-container"
          ref={workCardsRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="work-card" onMouseEnter={() => handleCardMouseEnter(0)}>
            <h3>RP Web Design</h3>
            <p>Software Company Founder</p>
          </div>
          <div className="work-card" onMouseEnter={() => handleCardMouseEnter(1)}>
            <h3>Lee-Solutions</h3>
            <p>Hardware Company Founder</p>
          </div>
          <div className="work-card" onMouseEnter={() => handleCardMouseEnter(2)}>
            <h3>LinkedIn</h3>
            <a href="https://www.linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer">Connect with me</a>
          </div>
        </div>
      </section>

      <section id="contact" className="section">
        <h2>Contact Me</h2>
        {!gameCompleted ? (
          <MiniGame />
        ) : (
          <form className="contact-form">
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Message" required />
            <button type="submit">Send Message</button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Portfolio;