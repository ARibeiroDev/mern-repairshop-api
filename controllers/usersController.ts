import type { Request, Response } from "express";
import { User, type IUser } from "../models/User.js";
import { type INote, Note } from "../models/Note.js";
import bcrypt from "bcrypt";

//@desc Get all users
//@route GET /users
//@access Private
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const users = await User.find().select("-password").lean<IUser[]>();
  if (!users?.length) {
    res.status(400).json({
      message: "No users Found",
    });
    return;
  }
  res.json(users);
};

//@desc Create new user
//@route POST /users
//@access Private

interface CreateUserBody {
  username: string;
  password: string;
  roles: string[];
}

export const createNewUser = async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response
): Promise<void> => {
  const { username, password, roles } = req.body;
  //Confirm data
  if (!username || !password) {
    res.status(400).json({ message: "All fields are required!" });
    return;
  }

  //Check duplicates
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean<IUser>()
    .exec();
  if (duplicate) {
    res.status(409).json({ message: "Duplicate username!" });
    return;
  }

  //Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashedPwd }
      : { username, password: hashedPwd, roles };

  //Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created!` });
  } else {
    res.status(400).json({ message: "Invalid user data received!" });
  }
};

//@desc Update a user
//@route PATCH /users
//@access Private

interface UpdateUserBody {
  id: string;
  username: string;
  roles: string[];
  active: boolean;
  password?: string;
}

export const updateUser = async (
  req: Request<{}, {}, UpdateUserBody>,
  res: Response
): Promise<void> => {
  const { id, username, roles, active, password } = req.body;

  //Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    res.status(400).json({ message: "All fields are required!" });
    return;
  }

  const user = await User.findById(id).exec();

  if (!user) {
    res.status(400).json({
      message: "User not found!",
    });
    return;
  }

  //Check duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  //Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    res
      .status(409)
      .json({ message: "Can't change username to an existing one!" });
    return;
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //Hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated!` });
};

//@desc Delete a user
//@route DELETE /users
//@access Private
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({
      message: "User ID required!",
    });
    return;
  }

  const note = await Note.findOne({ user: id }).lean<INote>().exec();

  if (note) {
    res.status(400).json({
      message: "User has assigned notes!",
    });
    return;
  }

  const deletedUser = await User.findByIdAndDelete(id).exec();

  if (!deletedUser) {
    res.status(400).json({
      message: "User not found!",
    });
    return;
  }

  const reply = `Username ${deletedUser.username} with ID ${deletedUser._id} deleted`;

  res.json({ reply });
};
