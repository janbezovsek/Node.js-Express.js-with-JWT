const mongoose = require('mongoose')
const validator = require("validator")
const bcryptjs = require("bcryptjs")


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
        minLength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Please enter your confirm password"],
        minLength: 8,
        validate: {
            validator: function(item) {
                return item === this.password
            },
            message: "Passwords are not matching"
        }
    },
    passwordChangedAt: Date
})

// Query middleware for hashing the password
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
    
    // Hash the password
    this.password = await bcryptjs.hash(this.password, 12)

    // Unset confirmPassword
    this.confirmPassword = undefined

    next();
})

userSchema.pre("save", function(next) {
    this.passwordChangedAt = Date.now() - 1;

    next();
})

userSchema.methods.passwordCheck = async function (userEnteredPassword, password) {
    return await bcryptjs.compare(userEnteredPassword, password)
}
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