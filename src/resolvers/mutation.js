
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
    updateProduct: async (parent, args, {userId}, info) => {
        const {id, description, price, imageUrl} = args

        //Check if user logged in
        if(!userId) throw new Error('Please log in.')

        //Find product in database
        const product = await Product.findById(id)

        //Check if user is the owner of the product
        // const userId = "5f2e440e61ee703cd9261483"

        if (userId !== product.user.toString()) {
            throw new Error('You are not authorized.')
        }

        //From updated information
        const updateInfo = {
            description: !!description ? description : product.description,
            price: !!price ? price : product.price,
            imageUrl: !!imageUrl ? imageUrl : product.imageUrl
        }

        //Update product in database
        await Product.findByIdAndUpdate(id, updateInfo)

        // Find the updated product
        const updatedProduct = await Product.findById(id).populate({ path: 'user' })

        return updatedProduct
    },
    createProduct: async (parent, args, { userId }, info) => {
        // const userId = '5f2e440e61ee703cd9261483'

        //Check if user logged in
        if (!userId) throw new Error('Please log in.')

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
    addToCart: async (parent, args, {userId}, info) => {
        // id --> productId
        const {id} = args

         //Check if user logged in
         if (!userId) throw new Error('Please log in.')

        try {
            //Find user who perform add to cart --> from logged in
            // const userId = "5f2e6bed711bcd44433a2ec9"

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
    },
    deleteCart: async (parent, args, {userId}, info) => {

        const { id } = args

         //Check if user logged in
         if (!userId) throw new Error('Please log in.')

        //FInd cart from given id
        const cart = await CartItem .findById(id)

        //check if user logged in

        // const userId = "5f2e6bed711bcd44433a2ec9"

        const user = await User.findById(userId)

        //Check owner ship of the cart
        if (cart.user.toString() !== userId) {
            throw new Error('Not authorized.')
        }

        const deletedCart = await CartItem.findOneAndRemove(id)

        const updatedUserCarts = user.carts.filter(cartId => cartId.toString() !== deletedCart.id.toString())

        await User.findByIdAndUpdate(userId, { carts: updatedUserCarts })

        return deletedCart
    }
}

export default Mutation