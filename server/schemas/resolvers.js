const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        users: async () => {
            return User.find()
        },
        user: async(parent, { userId }) => {
            return User.findOne({_id: userId})
        },
        me: async (parent, args, context) => {
            if (context.user) {
              return Profile.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        addProfiles: async (parent, {username, email, password}) => {
            const user = User.create({username, email, password});
            const token = signToken(user);

            return {token, profile};
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if (!user){
                throw new AuthenticationError('No user with this email found');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw){
                throw new AuthenticationError('Incorrect Password')
            }

            const token = signToken(profile);
            return { token, user} ;
        },
        //save book
        saveBook: async (parent, {user}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                  { _id: context.user._id },
                  { $push: { savedBooks: newBook }},
                  { new: true }
                );
                return updatedUser;
              }
              throw new AuthenticationError('You need to be logged in!');
        },
        //remove book
        removeBook: async (parent, {book}, context) => {
            if (context.user){
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {books: book}},
                    {new: true}
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be loggin in!');
        },

    },
};

module.exports = resolvers;