const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required: true
    },
    role:{
        type:String,
        enum:['admin','hr','manager'],
        require:true
    }
});
// Hash password befor saving 
AdminSchema.pre('save', async function(next){
    const adminSubmission = this;
    if(!adminSubmission.isModified('password')) return next();
    const hashedPassword = await bcrypt.hash(adminSubmission.password,10);
    adminSubmission.password = hashedPassword;
    next();
})
module.exports = mongoose.model('Admin',AdminSchema)