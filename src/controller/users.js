import jwt from "jsonwebtoken";
import { connect } from "../databases";
const claveSecreta = process.env.SECRET_KEY;

export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cnn = await connect();
    const q = `SELECT password_hash FROM usuarios WHERE email=?`;
    const value = [email];
    const [result] = await cnn.query(q, value);
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
  return result.length > 0;
};

export const createUsers = async (req, res) => {
  try {
    const cnn = await connect();
    const { email, nombre, password } = req.body;

    const emailExists = await validate("email", email, "usuarios", cnn);
    if (emailExists) {
      return res.status(400).json({ message: "El email ya está en uso", success: false });
    } 

    const [result] = await cnn.query(
      "INSERT INTO usuarios (email, nombre, password_hash) VALUES (?,?,?)",
      [email, nombre, password]
    );
    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "Se creó el usuario", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "No se creó el usuario", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message || "Error en el servidor", success: false });
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

export const saveMarker = async (req, res) => {
  try {
    const { userId, link } = req.body;
    const cnn = await connect();

    const userQuery = `SELECT * FROM usuarios WHERE id=?`;
    const [userResult] = await cnn.query(userQuery, [userId]);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado", success: false });
    }

    const markerQuery = `SELECT * FROM marcadores WHERE user_id = ? AND link = ?`;
    const [markerResult] = await cnn.query(markerQuery, [userId, link]);

    if (markerResult.length > 0) {
      return res.status(400).json({ message: "El marcador ya existe", success: false });
    }

    const insertMarkerQuery = `INSERT INTO marcadores (user_id, link) VALUES (?, ?)`;
    const [result] = await cnn.query(insertMarkerQuery, [userId, link]);

    if (result.affectedRows === 1) {
      return res.status(200).json({ message: "Marcador guardado correctamente", success: true });
    } else {
      return res.status(500).json({ message: "Error al guardar el marcador", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor", success: false, error: error });
  }
};


export const deleteMarker = async (req, res) => {
  try {
    const { markerId, userId } = req.body;
    const cnn = await connect();

    const markerQuery = `SELECT * FROM marcadores WHERE id = ? AND user_id = ?`;
    const [markerResult] = await cnn.query(markerQuery, [markerId, userId]);

    if (markerResult.length === 0) {
      return res.status(404).json({ message: "Marcador no encontrado o no pertenece al usuario", success: false });
    }

    const deleteQuery = `DELETE FROM marcadores WHERE id = ? AND user_id = ?`;
    const [result] = await cnn.query(deleteQuery, [markerId, userId]);

    if (result.affectedRows === 1) {
      return res.status(200).json({ message: "Marcador eliminado correctamente", success: true });
    } else {
      return res.status(500).json({ message: "Error al eliminar el marcador", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor", success: false, error: error });
  }
};

export const getUserMarkers = async (req, res) => {
  try {
    const { email } = req.query;  
    const cnn = await connect();

    const [result] = await cnn.query(`SELECT id FROM usuarios WHERE email=?`, [email]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado", success: false });
    }

    const userId = result[0].id;
    const [markers] = await cnn.query(`SELECT * FROM marcadores WHERE user_id=?`, [userId]);

    if (markers.length === 0) {
      return res.status(404).json({ message: "No se encontraron marcadores", success: false });
    }

    return res.status(200).json({ message: "Marcadores obtenidos", success: true, markers });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor", success: false, error });
  }
};
