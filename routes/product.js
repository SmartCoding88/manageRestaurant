const express = require('express');
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

//post
router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{

    let product = req.body;

    const post_query = "insert into product (name, categoryId, description, price, status) values(?,?,?,?, 'true')";

    connection.query(post_query,[product.name, product.categoryId, product.description, product.price] ,(err, results)=>{

        if(!err){

            return res.status(200).json({messge: "Product Added Successfully."});

        }else{
            return res.status(500).json(err);
        }

    })

});

//get
router.get("/get",auth.authenticateToken, (req,res, next)=>{
    var get_query = "Select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id";
    connection.query(get_query,(err, results)=>{
        
        if(!err){

            return res.status(200).json(results);

        }else{
            return res.status(500).json(err);
        }

    })
});

module.exports = router;