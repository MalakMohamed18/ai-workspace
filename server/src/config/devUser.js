import User from "../models/User.js";

export async function getDevelopmentUser() {
  let user = await User.findOne({
    email: "dev@workspace.local",
  });

  if (!user) {
    user = await User.create({
      name: "Development User",
      email: "dev@workspace.local",
    });
  }

  return user;
}