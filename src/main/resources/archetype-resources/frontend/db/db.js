import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { DataTypes } from "sequelize";
import TableName from "./tableName";

export default function (addon) {
  const url = addon.config.store().url;

  let sequelize;

  if (process.env.DB_URL) {
    sequelize = new Sequelize(process.env.DB_URL);
    console.log("Database connected ", process.env.DB_URL);
  } else if (url) {
    sequelize = new Sequelize(url);
    console.log("Database connected ", url);
  } else {
    sequelize = new Sequelize(null, null, null, {
      dialect: "sqlite",
    });
    console.log("Database conected to local storage");
  }

  sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch((err) => {
      console.error("Unable to connect to the database:", err);
    });

  const db = {};
  /*  fs.readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
    .forEach((file) => {
      let model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach((modelName) => {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db);
    }
  });*/
  db.tableName = TableName(sequelize, DataTypes);
  //TableName.sync().catch((err) => console.log(err));

  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("[ SEQUELIZE_SYNC_SUCCESS ]");
    })
    .catch((err) => {
      console.log("[ SEQUELIZE_SYNC_FAILED ]");
      console.log("[ err ]  == ", err);
    });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}
