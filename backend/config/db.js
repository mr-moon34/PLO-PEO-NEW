import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Direct MongoDB URI without using environment variables
    const mongoURI = "mongodb+srv://mrmuhammadmoon:DpThkYKgOu4oMgZp@cluster0.0zoohzx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    await mongoose.connect(mongoURI);
    console.log("MONGODB CONNECTED SUCCESSFULLY!");
  } catch (error) {
    console.error("Error connecting to MONGODB", error);
    process.exit(1); // exit with failure
  }
};
