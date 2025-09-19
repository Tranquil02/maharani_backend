const addtocart=async(req,res)=>{
    try{
        res.send("Order placed successfully");
    }
    catch(err){
        res.status(500).send("Error placing order");
    }
}