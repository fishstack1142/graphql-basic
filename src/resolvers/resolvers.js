// const users = [
//     {
//         id: "1",
//         name: "Somchai"
//     },
//     {
//         id: "2",
//         name: "Man"
//     },
//     {
//         id: "3",
//         name: "Girl"
//     },
// ]

// const me = users[2]

import User from '../models/user';

const Query = {
    // me: (parent, args, context, info) => me,
    user: (parent, args, context, info) => User.findById(args.id),
    // user: (parent, args, context, info) => {
    //     const id = args.id
    //     const user = users.find(u => u.id === id)

    //     return user
    // },
    users: (parent, args, context, info) => User.find({})
}

const Mutation =  {
    signup: (parent, args, context, info) => {

        return User.create(args);
    }
}

const resolvers = {

    Query: Query,
    Mutation: Mutation
}

export default resolvers