import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Switch = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const character = queryParams.get('character') || 'defaultCharacter';

    const handleCharacterChange = (event) => {
        const newCharacter = event.target.value;
        navigate(`${location.pathname}?character=${newCharacter}`);
    };

    return (
        <div>
            <h1>Character: {character}</h1>
            <select value={character} onChange={handleCharacterChange}>
                <option value="character1">Character 1</option>
                <option value="character2">Character 2</option>
                <option value="character3">Character 3</option>
                <option value="1178">Character 1178</option>
                <option value="1718">Character 1718</option>
                <option value="3134">Character 3134</option>
                <option value="5309">Character 5309</option>
                <option value="bunnyslimeRez">Character Bunny Slime</option>
                <option value="8733">Character 8733</option>
                <option value="342">Character 342</option>
            </select>
        </div>
    );
};

export default Switch;

