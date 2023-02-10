const express = require('express');
const connection = require('../connection');
const router = express.Router();

router.post("/signup",(req,res)=>{

    let user = req.body;
    query = "Select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (err,results)=>{

        if(!err){

            if(results.length <=0){
                query = "INSERT INTO user(name, contactNumber, email, password, status, role) values(?,?,?,?,'false','user')";
                connection.query(query, [
                    user.name,
                    user.contactNumber,
                    user.email,
                    user.password

                ] ,
                (err, resp)=>{
                    if(!err){
                        return res.status(200).json({message: "Successfully Registered !"});
                    }else{
                        return res.status(500).json(err);
                    }

                })
            }else{
                return res.status(400).json({message: "Email Already Exists !"});
            }

        }else{
    
            return res.status(500).json(err);
        }

    });
    
    

})

module.exports = router;