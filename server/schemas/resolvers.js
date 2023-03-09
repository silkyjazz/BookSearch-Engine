const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        // users: async () => {
        //     return User.find()
        // },
        // user: async(parent, { userId }) => {
        //     return User.findOne({_id: userId})
        // },
        me: async (parent, args, context) => {
            if (context.user) {
              return Profile.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            const user = User.create({username, email, password});
            const token = signToken(user);

            return {token, user};
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

            const token = signToken(user);
            return { token, user} ;
        },
        //save book
        saveBook: async (parent, book, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id},
                    {
                      $addToSet: { savedBooks: book},
                    },
                    {
                      new: true,
                      runValidators: true 
                    }
                  );
              }
              throw new AuthenticationError('You need to be logged in!');
        },
        //remove book
        removeBook: async (parent, {bookId}, context) => {
            if (context.user){
               return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: { savedBooks: { bookId: bookId } }},
                    {new: true}
                );
          
            }
            throw new AuthenticationError('You need to be loggin in!');
        },

    },
};

module.exports = resolvers;