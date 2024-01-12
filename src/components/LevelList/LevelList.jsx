import { useState, useEffect } from "react";

//visual repesentation of tile
const LevelList = (props) => {

    const {levels} = props;

    const currentLevel = useState(levels[0])

    let buttons = levels.map(
        <input type="radio" id="html" name="fav_language" value="HTML"></input>
    )

    return (
        <div className="LevelList">
           <input type="radio" id="html" name="fav_language" value="HTML"></input>
        </div>
    )
}

export default LevelList;