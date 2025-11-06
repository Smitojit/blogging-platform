const Post= require('../models/Post');

exports.createPost= async(req, res) =>{
    try{
        const {title, content, tags}=req.body;
        if(!title || !content)return res.status(400).json({message: 'Title and content required'});

        const post=await Post.create({
            title,content, tags: tags || [], author:req.user._id
        });
        res.status(201).json(post);
    } catch(err){
        return res.status(500).json({message: err.message});
    }

};

exports.getPosts= async(req,res) => {
    try{
        const page =Number(req.query.page)||1;
        const limit= Math.min(Number(req.query.limit)|| 10, 50);
        const skip=(page-1)*limit;

        const posts= await Post.find()
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        .populate('author','name email');

        res.json(posts);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

exports.getPostById= async(req,res) => {
    try{
        const post= await Post.findById(req.params.id).populate('author','name email');
        if(!post) return res.status(404).json({message: 'Post not found'});
        res.json(post);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

exports.updatePost= async (req,res) =>{
    try{
        const post= await Post.findById(req.params.id);
        if(!post) return res.status(404).json({message:'Post not found'});
        const authorId=post.author._id? post.author._id.toString() : post.author.toString();
        
        if(authorId!== req.user._id.toString() && req.user.role !=='admin'){
            return res.status(403).json({message: 'Not allowed'});
        }
        
        const {title, content, tags}= req.body;
        if(title!==undefined) post.title=title;
        if(content !=undefined) post.content=content;
        if(tags != undefined) post.tags=tags;
        const updated=await post.save();
        res.json(updated);

    }catch(err){
        res.status(500).json({message: err.message});
    }
};

exports.deletePost= async (req,res) =>{
    try{
        const post =await Post.findById(req.params.id);
        if(!post) return res.status(404).json({message: 'Post not found'});

        if(post.author.toString()!== req.user._id.toString() && req.user.role!=='admin'){
            return res.status(403).json({message: 'Not allowed'});
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({message: 'Post deleted'});
    }catch(err){
        res.status(500).json({message: err.message});
    }
};