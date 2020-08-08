
import User from '../models/user';
import Product from '../models/product'
import bcrypt from 'bcryptjs';
import CartItem from '../models/cartItem';

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
        const userId = '5f2e440e61ee703cd9261483'

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
    },
    addToCart: async (parent, args, context, info) => {
        // id --> productId
        const {id} = args
        try {
            //Find user who perform add to cart --> from logged in
            const userId = "5f2e6bed711bcd44433a2ec9"
            
            //check cart
            const user = await User.findById(userId).populate({
                path: 'carts', 
                populate: { path: "product" }
            })

            const findCartItemIndex = user.carts.findIndex(cartItem => cartItem.product.id === id)

            if (findCartItemIndex > -1) {
            //aa. already in cart
            //aa.1 find the cartitem from db
            user.carts[findCartItemIndex].quantity += 1

            await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
                quantity: user.carts[findCartItemIndex].quantity
            })
            //aa.2 update the quantity

            const updatedCartItem = await CartItem.findById(user.carts[findCartItemIndex].id)
            .populate({ path: "product" })
            .populate({ path: "user" })

            return updatedCartItem
           
            } else {
                //bb. not in cart yet
                //bb.1 create cart item
                const cartItem = await CartItem.create({
                    product: id,
                    quantity: 1,
                    user: userId
                })

                //bb.2 update user.carts
                const newCartItem = await CartItem.findById(cartItem.id)
                .populate({ path: "product" })
                .populate({ path: "user" })


                //update user cart item
                await User.findByIdAndUpdate(userId, {carts: [...user.carts, newCartItem]})

                return newCartItem
            }
        } catch (error) {
            console.log(error)
        }
    }
}

export default Mutation