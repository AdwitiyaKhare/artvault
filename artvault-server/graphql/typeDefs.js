// graphql/typeDefs.js
import gql from "graphql-tag";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    credits: Int!
  }

  type Art {
    id: ID!
    title: String!
    description: String
    imageUrl: String!
    price: Int!
    owner: User!
    sold: Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    allArt: [Art]
    myArt: [Art]
    availableArt: [Art]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    uploadArt(
      title: String!
      description: String
      imageUrl: String!
      price: Int!
    ): Art
    buyArt(artId: ID!): Art
  }
`;

export default typeDefs;
