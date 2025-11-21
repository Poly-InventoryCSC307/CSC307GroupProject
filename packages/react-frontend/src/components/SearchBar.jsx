import React, {useState} from 'react';
import searchIcon from "../assets/search-button.svg";
import "./SearchBar.css"

function SearchBar({onSearch}){
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (event) =>{
        setSearchTerm(event.target.value);
        onSearch(event.target.value);
    };

    return (
        <div className='input-wrapper'>
            <img src={searchIcon} alt="Search" className="icon search" />
            <input 
                placeholder='Search Product or SKU...'
                value={searchTerm}
                onChange={handleChange}
            />
        </div>
    );
}

export default SearchBar;