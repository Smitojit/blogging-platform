const jwt= require('jsonwebtoken');
const User=require('../models/User');

const generateToken= (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:'7d'});
};

exports.register = async(req,res) =>{
    const{name, email, password}= req.body;
    try{
        if(!name || !email || !password) return res.status(400).json({message: 'All fields required'});

        const exists = await User.findOne({email});
        if(exists) return res.status(400).json({message: 'Email already in use'});

        const user = await User.create({name, email, password});
        res.status(201).json({
            token: generateToken(user.id),
            user: {id: user._id, name: user.name, email: user.email}
        });
    } catch(err){
        res.status(500).json({message:err.message});
    }
};

exports.login=async(req,res)=>{
    const{email, password}=req.body;
    try{
        if(!email || !password) return res.status(400).json({message:'All fields required'});

        const user= await User.findOne({email});
        if(!user) return res.status(401).json({message: 'Invalid Credentials'});

        const isMatch= await user.matchPassword(password);
        if(!isMatch) return res.status(401).json({message: 'Invalid Credentials'});

        res.json({
            token: generateToken(user._id),
            user: {id: user._id, name: user.name, email: user.email}
        });
    } catch(err){
        return res.status(500).json({message: err.message});
    }
};

exports.getProfile = async(req,res) =>{
    if(!req.user) return res.status(401).json({message: 'Not authenticated'});
    const {_id, name, email, role}=req.user;
    res.json({id: _id, name, email,role});
};