const express = require('express');
const connection = require('../connection');

const router = express.Router();
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

//post
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{

    let category = req.body;

    var post_query = "insert into category (name) values(?)";

    connection.query(post_query, [category.name],(err, results)=>{
        if(!err){
            return res.status(200).json({message: "Catgeory added successfully"})
        }else{
            return res.status(500).json(err);
        }
    })
});

//get
router.get("/get", auth.authenticateToken, (req, res, next)=>{
    var get_query ="select * from category";
    connection.query(get_query),(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }else{
            return res.status(500).json(err);
        }
    }
});

//patch
router.patch("/update", auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let category = req.body;

    var patch_query = "updat category set name=? where id=?";
    connection.query(patch_query, (err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message: "Category id is not found"});
            }
                return res.status(200).json({message:"Catgeory updated successfully"});
            
        }else{
            return res.status(500).json(err);
        }
    })
});

module.exports = router;
