const mongoose = require('mongoose')
const validator = require("validator")
const bcrypt = require("bcryptjs")


const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: [true, "Please enter user name"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: 8
    },
    passwordChangedAt: Date
})

userSchema.methods.matchPassword = async function(enteredPassword) {
//comparing passwords from database and what user typed in
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function(next) {
    if(!this.isModified) {
        next()
    }
    //encrypting password
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.tokenAvailabilityCheck = async function(jwtTimestamp){
    if(this.passwordChangedAt){
        const passwordChangedAtTimestamp = parseInt(this.passwordChangedAt.getTime() /1000, 10)

        // The password has been not changed before the jwt issuing
        // Or the jwt is issued after the latest password changed
        return jwtTimestamp < passwordChangedAtTimestamp;
    }
    return false;
}

const User = mongoose.model("User", userSchema)

module.exports = User