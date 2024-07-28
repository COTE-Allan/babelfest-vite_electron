import React, { useContext, useState } from 'react';
import { GiConfirmed } from 'react-icons/gi';
import Hand from '../interface/inGame/Hand';
import { TutorialContext } from '../providers/TutorialProvider';
import { AuthContext } from '../../AuthContext';
import '../../styles/interface/inGame/arena.scss';
import '../../styles/items/cell.scss';
import '../../styles/items/card.scss';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const TutorialText = ({ children, onClickNext, clickable }) => {
  return (
    <div className={`tutorial-text ${clickable ? 'clickable' : ''}`} onClick={clickable ? onClickNext : null}>
      <div className="tutorial-text-speaker">
        <img src="" className='tutorial-text-speaker-img' alt="Speaker" />
        <h1>Tuto</h1>
      </div>
      <hr />
      <div className="tutorial-text-content">
        {children}
      </div>
    </div>
  );
};

export default function TutorialRoom() {
  const { hand, placementCostLeft, rival, turn, pattern, setPattern, setHand, rivalHand } = useContext(TutorialContext);
  const { user, userInfo } = useContext(AuthContext);

  const [tutorialStep, setTutorialStep] = useState(1);
  const [selectedCell, setSelectedCell] = useState(null);

  const stepsConfig = [
    { text: "Un nouvel adversaire ?", clickable: true, action: () => setTutorialStep(2) },
    { text: "Bienvenue sur Babelfest !", clickable: true, action: () => setTutorialStep(3) },
    { 
      text: "Je place ma première carte", 
      clickable: true, 
      action: () => {
        setPattern(pattern.map(cell => (cell.id === 14 ? { ...cell, card: rivalHand[0], owner: 2 } : cell)));
        setTutorialStep(4);
      }
    },
    { 
      text: "Je place ma deuxième carte", 
      clickable: true, 
      action: () => {
        setPattern(pattern.map(cell => (cell.id === 2 ? { ...cell, card: rivalHand[1], owner: 2 } : cell)));
        setTutorialStep(5);
      }
    },
    { text: "Choisis une carte", clickable: false },
    { text: "Pose ta carte", clickable: false },
    { text: "Choisis une autre carte", clickable: false },
    { text: "Pose ta deuxième carte", clickable: false }
  ];

  const handleCardClick = (index) => {
    if (tutorialStep === 5 && index === 0) {
      setTutorialStep(6);
    } else if (tutorialStep === 7 && index === 0) {
      setTutorialStep(8);
    }
  };

  const handleCellClick = (id) => {
    if (tutorialStep === 6 && id === 18) {
      if (selectedCell === id) {
        setPattern(pattern.map(cell => (cell.id === 18 ? { ...cell, card: hand[0], owner: 1 } : cell)));
        setHand(hand.slice(1));
        setSelectedCell(null);
        setTutorialStep(7);
      } else {
        setSelectedCell(id);
      }
    } else if (tutorialStep === 8 && id === 17) {
      if (selectedCell === id) {
        setPattern(pattern.map(cell => (cell.id === 17 ? { ...cell, card: hand[0], owner: 1 } : cell)));
        setHand(hand.slice(1));
        setSelectedCell(null);
        setTutorialStep(9);
      } else {
        setSelectedCell(id);
      }
    }
  };

  const handleTextClick = () => {
    if (stepsConfig[tutorialStep - 1].clickable) {
      stepsConfig[tutorialStep - 1].action();
    }
  };

  return (
    <>
      <div className="gameContainer">
        <Hand>
          {hand.map((card, index) => (
            <div
              key={index}
              className={`card ${placementCostLeft - card.rarity < 0 ? 'card-unusable' : ''} ${card.shiny ? card.shiny : ''} ${
                tutorialStep === 5 && index === 0 ? 'important' : ''} ${tutorialStep === 6 && index === 0 ? 'card-selected' : ''} ${
                tutorialStep === 7 && index === 0 ? 'important' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="img-container">
                <div className={`card-cost`}>
                  <span className={`txt-rarity-${card.rarity}`}>{card.rarity}</span>
                </div>
                <img className="card-visual" src={card.url} alt={`card-${index}`} />
                {tutorialStep === 6 && index === 0 && <div className="card-filter"></div>}
              </div>
            </div>
          ))}
        </Hand>
        <div className="arena-wrapper" onContextMenu={(e) => e.preventDefault()}>
          <TransformWrapper minScale={0.5} maxScale={2.5} initialScale={0.65} centerOnInit={true} doubleClick={{ disabled: true }} velocityAnimation={{ disabled: false, sensitivity: 100 }}>
            <TransformComponent>
              <div className="arena">
                {pattern.map((cell, index) => {
                  if (!cell.exist) {
                    return <div key={index} className="cell cell-inexistant" id={cell.id} data-team={cell.side} />;
                  }
                  return (
                    <div
                      key={index}
                      className={`cell ${tutorialStep === 6 && cell.id === 18 ? 'important' : ''} ${tutorialStep === 8 && cell.id === 17 ? 'important' : ''} ${
                        selectedCell === cell.id ? 'selected' : ''}`}
                      id={cell.id}
                      data-team={cell.side}
                      style={{
                        backgroundColor: cell.side && cell.base ? (cell.side === 2 ? userInfo.primaryColor : rival.primaryColor) : '#000',
                        '--rotation': `0deg`,
                        borderColor: cell.owner ? (cell.owner === 1 ? userInfo.primaryColor : rival.primaryColor) : '#fff'
                      }}
                      onClick={() => handleCellClick(cell.id)}
                    >
                      {selectedCell === cell.id && <GiConfirmed size={90} />}
                      {cell.card && (
                        <div className="cell-card">
                          <div className="cell-card-stats">
                            {[cell.card.atk, cell.card.dep, cell.card.hp].map((stat, key) => (
                              <div key={key} className="cell-card-stats-item">{stat}</div>
                            ))}
                          </div>
                          <img className="cell-card-visual" src={cell.card.url} alt={`card-${cell.id}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="arena-borders">
                <div className={`arena-borders-container`}>
                  <div
                    className="arena-borders-item"
                    style={{ backgroundColor: !turn % 2 === 0 ? rival.primaryColor : '#939393', boxShadow: !turn % 2 === 0 ? `0 -10px 70px ${rival.primaryColor}` : 'none' }}
                  ></div>
                  <div
                    className="arena-borders-item"
                    style={{ backgroundColor: turn % 2 === 0 ? userInfo.primaryColor : '#939393', boxShadow: turn % 2 === 0 ? `0 10px 70px ${userInfo.primaryColor}` : 'none' }}
                  ></div>
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>
      <div className="gameContainer-filter" style={{ background: `${turn % 2 === 0 ? userInfo.primaryColor : rival.primaryColor}` }}></div>
      <img className={`gameContainer-bg`} src="https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt={'background du menu'} />
      <TutorialText onClickNext={handleTextClick} clickable={stepsConfig[tutorialStep - 1].clickable}>
        {stepsConfig[tutorialStep - 1].text}
      </TutorialText>
    </>
  );
}
