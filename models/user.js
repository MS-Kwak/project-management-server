module.exports = function (sequelize, DataTypes) {
  // 테이블을 만드는데, 테이블 이름은 'OAuth'
  const user = sequelize.define('User', {
    userId: {
      type: DataTypes.STRING(20), // 데이터 타입은 문자열이고, 20자까지 제한
      allowNull: false, // 값이 꼭 있어야만 한다!
    },
    password: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
  });

  return user;
};
