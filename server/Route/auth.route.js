import express from 'express';
import User from '../model/auth.model.js';
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const router = express.Router();

router.post('/sign-up', async (req, res) => {
    console.log("request received");
    
    const { name, email, password} = req.body; // data from form
    console.log(name, email, password);
    const existingUser = await User
    .findOne({ email: email }); // check user exist in database
    if (existingUser) return res.send(JSON.stringify({ok: false, message: "User already exist"}));
    
    const hashedPassword = bcryptjs.hashSync(password, 10); // hash password
    const newUser = new User({ name, email, password: hashedPassword}); //create user
    try {
        await newUser.save();
        res.status(201).json('User created successfully!');
    } catch (error) {
        console.log(error);
        res.status(500).json('Error: ' + error);
        
    }
});

router.post('/log-in', async (req, res) => {
    const { email, password} = req.body;
    console.log("hiii");
    
  
    try {
      const validUser = await User.findOne({ email: email }); // check user exist in database
      if (!validUser) return res.send(JSON.stringify({ok: false, message: "User doesn't exist"}));
  
      const validPassword = bcryptjs.compareSync(password, validUser.password); // check entered password
      if (!validPassword) return res.send(JSON.stringify({ok: false, message: "Invalid password."}));
      
      const token = jwt.sign({ id: validUser._id}, process.env.JWT_SECRET); // create token to store in cookie
      console.log(token);
      const { password: pass, ...rest } = validUser._doc;
      res
        .cookie('access_token', token) // store token in cookies
        .status(200)
        .json({ok: true, ...rest});
    } catch (error) {
      console.log(error);
        res.status(500).json({ok: false, message: "User exist"});
      
    }
});

export default router;