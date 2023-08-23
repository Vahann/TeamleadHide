export default function (sequelize, DataTypes) {
  const TableName = sequelize.define(
    "tablename",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
        len: [2, 50],
      },
      user_id: {
        type: DataTypes.STRING,
      },
      instance_id: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return TableName;
}
