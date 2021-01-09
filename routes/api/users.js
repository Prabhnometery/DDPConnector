const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const User = require('../../models/User');


// Register User
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a vaild Email').isEmail(),
    check('password', 'Please enter a password wiht 6 or more characters').isLength({ min: 6})

], async (req,res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }

    const { name, email, password} = req.body;

    try {
        
        let user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({ errors: [ {msg: 'User already exists' }]});
        }


        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            ...req.body,
            avatar
        })

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

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
