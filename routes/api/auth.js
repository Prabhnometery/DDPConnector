const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth')

const User = require('../../models/User')

router.get('/', auth, async (req,res) => {
    try {
        const id = req.user.id
        const user = await User.findById(id).select('-password')

        if(!user) {
            return res.status(400).json({ msg: 'User not found'})
        }

        res.json(user)

    } catch (e) {
        console.log(e.message);
        res.status(500).send('Server Error')

    }
});

// Login User
router.post('/', [
    check('email', 'Please include a vaild Email').isEmail(),
    check('password', 'Password is required').exists()

], async (req,res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }

    const { email, password} = req.body;

    try {
        
        let user = await User.findOne({ email });

        if(!user) {
            return res.status(400).json({ errors: [ {msg: 'Inavild Credentials' }]});
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
            return res.status(400).json({ errors: [ {msg: 'Inavild Credentials' }]});
        }

        const payload =  {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err,token) => {
            if(err) {
                throw err
            }
            res.json({token})
        })

    } catch (e) {
        console.error(e)
        res.status(500).send('Server Error')

    }



})

module.exports = router;