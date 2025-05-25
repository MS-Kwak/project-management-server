const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const models = require('./models/index.js');
const user = require('./models/user.js');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: 'http://localhost:5174', // 클라이언트 주소로 지정
    credentials: true, // 쿠키 전달을 허용
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

require('dotenv').config(); // 환경변수 로드
const SECRET_KEY = process.env.JWT_SECRET_KEY; // JWT 비밀키

app.get('/login', (req, res) => {
  models.User.findAll({
    attributes: ['userId', 'password'],
  })
    .then((result) => {
      res.send({
        users: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: '서버 에러!!' });
    });
});

app.post('/login', (req, res) => {
  const { userId, password } = req.body;

  models.User.findOne({ where: { userId, password } })
    .then((result) => {
      console.log(result);
      if (result) {
        const token = jwt.sign({ userId: result.userId }, SECRET_KEY, {
          expiresIn: '2h',
        });
        res.cookie('token', token, { httpOnly: true, secure: false }); // HTTPS에서는 secure:true
        res.send({ success: true, message: '로그인 성공!!' });
      } else {
        res
          .status(401)
          .send({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: '서버 에러!!' });
    });
});

// 로그아웃 API (쿠키 삭제)
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.send({ success: true, message: '로그아웃 성공!!' });
});

function verifyToken(token, SECRET_KEY) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

// 인증된 사용자 정보 요청
app.get('/profile', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: '인증 필요!!' });
  }

  verifyToken(token, SECRET_KEY)
    .then((decoded) => {
      // 검증 성공 시 decoded object 반환
      res.send({ userId: decoded.userId });
    })
    .catch((err) => {
      console.error(err);
      res.status(403).send({ message: '유효하지 않은 토큰!!' });
    });
});

app.listen(PORT, () => {
  console.log(`보노보의 관리자 서버가 돌아가고 있습니다 PORT: ${PORT}`);

  models.sequelize
    .sync()
    .then(() => {
      console.log('DB 연결 성공!');
      // database.sqlite3 파일이 생성되고, 앞으로 DB가 들어갈꺼에요~
    })
    .catch((err) => {
      console.error(err);
      console.log('DB 연결 에러ㅠ');
      process.exit(); // DB연결 안되면 서버와의 연결을 종료!
    });
});
