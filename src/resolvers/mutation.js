
import User from '../models/user';
import Product from '../models/product'
import bcrypt from 'bcryptjs';

const Mutation =  {
    signup: async (parent, args, context, info) => {

        const email = args.email.trim().toLowerCase()

        const currentUsers = await User.find({})
        const isEmailExist = currentUsers.findIndex(user => user.email === email) > -1

        if (isEmailExist) {
            throw new Error('Email already exist.')
        }

        if (args.password.trim().length < 6) {
            throw new  Error('Password must be at least 6 characters.');
        }

        const password = await bcrypt.hash(args.password, 10);

        return User.create({...args, email, password});
    },
    createProduct: async (parent, args, context, info) => {
        const userId = '5f2e13b8e92bf73492a738eb'

        if (!args.description || !args.price || !args.imageUrl) {
            throw new Error('Please provide all required fields.')
        }

        const product = await Product.create({...args, user: userId})
        const user = await User.findById(userId)

        if (!user.products) {
            user.products = [product]
        } else {
            user.products.push(product)
        }

        await user.save()

        return Product.findById(product.id).populate({
            path: "user",
            populate: { path: "products" }
        })
    }
}

export default Mutation