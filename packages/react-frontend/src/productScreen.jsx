import React, {useState} from "react";
import Table from "./Table";
import Form from "./Form";

function ProductScreen(){
    const[characters, setCharacters] = useState([]);

    function updateList(product){
        setCharacters([...characters, product]);
    }
    function removeOneCharacter(index){
        const updated = characters.filter((character, i) => {
            return i !== index;
        });
        setCharacters(updated);
    }

    return (
        <div className ="container">
            <Table
            characterData = {characters}
            removeCharacter={removeOneCharacter}
            />
            <Form handleSubmit={updateList}/>
        </div>
    );
}
export default ProductScreen;