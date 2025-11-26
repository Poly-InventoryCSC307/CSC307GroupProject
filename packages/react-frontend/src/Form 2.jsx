import React, {useState} from "react";

function Form(props) {
    const [product, setProduct] = useState({
        productName: "",
        quantity: ""
    });

    function handleChange(event){
        const {name, value} = event.target;
        setProduct(prev => ({ ...prev, [name]: value}));
    }

    function submitForm(){
        props.handleSubmit(product);
        setProduct({productName:"", quantity:""});
    }

    return(
        <form>
            <label htmlFor="productName">Name</label>
            <input 
            type="text"
            name = "productName"
            id = "productName"
            value = {product.productName}
            onChange = {handleChange}
            />

            <label htmlFor = "quantity">Quantity</label>
            <input
            type = "text"
            name = "quantity"
            id = "quantity"
            value = {product.quantity}
            onChange = {handleChange}
            />

            <input type="button" value="Submit" onClick={submitForm}/>
        </form>
    );
}
export default Form;