import bcrypt from "bcrypt";

// Hash the password
export const hashPassword = async (password) => {
  try {
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error; // Let controller handle it
  }
};

// Compare password with hashed one
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};
