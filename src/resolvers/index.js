import { GraphQLDateTime } from 'graphql-iso-date'

import Query from './query';
import Mutation from './mutation'


const resolvers = {
    Query: Query,
    Mutation: Mutation,
    Date: GraphQLDateTime
}

export default resolvers