import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  OFFICE_LATITUDE: Number(process.env.OFFICE_LATITUDE),
  OFFICE_LONGITUDE: Number(process.env.OFFICE_LONGITUDE),
  OFFICE_RADIUS_METERS: Number(process.env.OFFICE_RADIUS_METERS),
  MAX_GPS_ACCURACY_METERS: Number(process.env.MAX_GPS_ACCURACY_METERS),
};
