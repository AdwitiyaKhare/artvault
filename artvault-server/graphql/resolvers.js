// graphql/resolvers.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Art from "../models/Art.js";

const resolvers = {
  Query: {
    me: (_, __, { user }) => user,
    allArt: () => Art.find().populate("owner"),
    myArt: (_, __, { user }) => Art.find({ owner: user._id }),
    availableArt: (_, __, { user }) =>
      Art.find({ sold: false, owner: { $ne: user._id } }),
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        credits: 2000,
      });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid credentials");
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return { token, user };
    },
    uploadArt: async (_, { title, description, imageUrl, price }, { user }) => {
      const art = await Art.create({
        title,
        description,
        imageUrl,
        price,
        owner: user._id,
        sold: false,
      });
      return art.populate("owner");
    },
    buyArt: async (_, { artId }, { user }) => {
      const art = await Art.findById(artId).populate("owner");
      if (art.sold || art.owner.id === user._id.toString())
        throw new Error("Invalid purchase");

      const buyer = await User.findById(user._id);
      const seller = await User.findById(art.owner.id);

      if (buyer.credits < art.price) throw new Error("Insufficient credits");

      buyer.credits -= art.price;
      seller.credits += art.price;
      art.owner = buyer._id;
      art.sold = true;

      await buyer.save();
      await seller.save();
      await art.save();

      return art.populate("owner");
    },
  },
};

export default resolvers;
