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

//getByCategory
router.get("/getByCategory/:id",auth.authenticateToken,(req,res,next)=>{

    const id= req.params.id;
    var query = "select id, name, description, price from product where categoryId=? and status='true'";

    connection.query(query, [id], (err,results)=>{

        if(!err){

            return res.status(200).json(results);

        }else{

            return res.status(500).json(err);

        }

    });

});


//getProductById
router.get("/getById/:id",auth.authenticateToken,(req,res,next)=>{

    const id= req.params.id;
    var query = "select id, name, description, price from product where id=?";

    connection.query(query, [id], (err,results)=>{

        if(!err){

            return res.status(200).json(results);

        }else{

            return res.status(500).json(err);

        }

    });

});

//patch
router.patch("/update",auth.authenticateToken, checkRole.checkRole, (req,res,next)=>{
    let product =req.body;
    var query ="update product set name=?, categoryId=?, description=?, price=? where id=?";

    connection.query(query, [product.name,product.categoryId, product.description, product.price, product.id], (err, results)=>{

        if(!err){
            if(results.affectedRows ==0){
                return res.status(400).json({mesage:"Product id is not found"});
            }

            return res.status(200).json({message: "Product updated successfully"});
        }else{
            return res.status(500).json(err);
        }

    });
});

//delete
router.delete("/delete/:id",auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{

    const id= req.params.id;
    var query = "delete from product where id=?";

    connection.query(query, [id],(err, results)=>{

        if(!err){

            if(results.affectedRows ==0){
                return res.status(400).json({mesage:"Product id is not found"});
            }

            return res.status(200).json({message: "Product deleted successfully"});

        }
        else{
            return res.status(500).json(err);
        }

    })

});

//update status
router.patch("/updateStatus",auth.authenticateToken,checkRole.checkRole, (req, res, next)=>{

    let product = req.body;
    var query = "update product set status=? where id=?";
    connection.query(query, [product.status,product.id], (err, results)=>{

        if(!err){

            if(results.affectedRows ==0){
                return res.status(400).json({mesage:"Product id is not found"});
            }

            return res.status(200).json({message: "Product Status Updated successfully"});

        }else{
            return res.status(500).json(err);
        }

    })

});


module.exports = router;