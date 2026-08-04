import React, { useState, useEffect } from 'react';

const UserLevelsContainer = ({ onLoadLevel }) => {
    const [userLevels, setUserLevels] = useState(Array(10).fill(null));

    useEffect(() => {
        const storedLevels = localStorage.getItem('userLevels');
        if (storedLevels) {
            try {
                const parsed = JSON.parse(storedLevels);
                // Ensure it's an array of 10 slots
                const padded = Array(10).fill(null);
                parsed.forEach((val, idx) => {
                    if (idx < 10) padded[idx] = val;
                });
                setUserLevels(padded);
            } catch (e) {
                console.error("Failed to parse user levels from local storage", e);
            }
        }
    }, []);

    return (
        <div className="game-container">
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>User Levels</h2>
            <div className="levels-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                {userLevels.map((level, index) => (
                    <button 
                        key={index}
                        onClick={() => level && onLoadLevel(level)}
                        style={{ width: '80%', padding: '15px', fontSize: '1.2rem', textAlign: 'left', cursor: level ? 'pointer' : 'default', opacity: level ? 1 : 0.6 }}
                        disabled={!level}
                    >
                        Slot {index + 1}: {level ? level.name : 'Empty'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default UserLevelsContainer;
