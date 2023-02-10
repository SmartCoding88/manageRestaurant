const express = require('express');
const { query } = require('../connection');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

//register
router.post("/signup",(req,res)=>{

    let user = req.body;
    register_query = "Select email, password, role, status from user where email=?";
    connection.query(register_query, [user.email], (err,results)=>{

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
    
    

});

//login
router.post("/login", (req,res)=>{

    const user = req.body;

    login_query= "SELECT email, password, role, status from user where email=?";

    connection.query(login_query, [user.email], (err, results)=>{

        if(!err){
            if(results.length <= 0 || results[0].password !==user.password){

                res.status(401).json({message: "Incorrect Username or Password"});

            }else if(results[0].status === 'false'){

                return res.status(401).json({message:"Wait for Admin Approval"});

            }else if(results[0].password == user.password){

                const response = {
                    email: results[0].email,
                    role: results[0].role
                };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {expiresIn:'8h'});

                res.status(200).json({token: accessToken});

            }else{
                return res.status(400).json({message: "Something went wrong.Please try later"});
            }
        }else{

            return res.status(500).json(err);

        }

    });
});

module.exports = router;