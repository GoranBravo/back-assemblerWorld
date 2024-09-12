import jwt from "jsonwebtoken";
import { connect } from "../databases";
const claveSecreta = process.env.SECRET_KEY;

export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    const cnn = await connect();
    const q = `SELECT password_hash FROM usuarios WHERE email=?`;
    const value = [email];
    const [result] = await cnn.query(q, value);
    console.log(result);
    if (result.length > 0) {
      if (result[0].password_hash === password) {
        const token = getToken({ email: email });
        return res
          .status(200)
          .json({ message: "correcto", success: true, token: token });
      } else {
        return res.status(400).json({ message: "la contraseña no coincide", success: false });
      }
    } else {
      return res.status(400).json({ message: "el usuario no existe", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "fallo en catch", success: false, error: error });
  }
};

const validate = async (campo, valor, tabla, cnn) => {
  const q = `SELECT * FROM ${tabla} WHERE ${campo}=?`;
  const value = [valor];

  const [result] = await cnn.query(q, value);
  console.log("validar", result);

  return result;
};

//crear usuarios desde el sigup
export const createUsers = async (req, res) => {
  try {
    const cnn = await connect();
    const { email, nombre, password } = req.body;
    //validar la existencia de el email

    if (validate("email", email, "usuarios", cnn)) {
      console.log("ok");
    }

    const [result] = await cnn.query(
      "INSERT INTO usuarios (email, nombre, password_hash) VALUES (?,?,?)",
      [email, nombre, password]
    );
    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "se creo el usuario", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "no se creo el usuario", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

export const auth = (req, res, next) => {
  const tokenFront = req.headers["auth"];
  if (!tokenFront) return res.status(400).json({ message: "no hay token" });
  jwt.verify(tokenFront, claveSecreta, (error, payload) => {
    if (error) {
      return res.status(400).json({ message: "el token no es valido" });
    } else {
      req.payload = payload;
      next();
    }
  });
};

const getToken = (payload) => {
  const token = jwt.sign(payload, claveSecreta, { expiresIn: "1000000000000000000000000000h" });
  return token;
};
