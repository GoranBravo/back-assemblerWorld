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
          .json({ message: "Correcto", success: true, token: token });
      } else {
        return res
          .status(400)
          .json({ message: "La contraseña no coincide", success: false });
      }
    } else {
      return res
        .status(400)
        .json({ message: "El usuario no existe", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fallo en catch", success: false, error: error });
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
      return res
        .status(400)
        .json({ message: "El email ya está en uso", success: false });
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
    return res
      .status(500)
      .json({
        message: error.message || "Error en el servidor",
        success: false,
      });
  }
};

export const auth = (req, res, next) => {
  const tokenFront = req.headers["auth"];

  if (!tokenFront) return res.status(400).json({ message: "no hay token" });
  jwt.verify(tokenFront, claveSecreta, (error, payload) => {
    if (error) {
      return res.status(400).json({ message: "El token no es valido" });
    } else {
      req.payload = payload;
      next();
    }
  });
};

const getToken = (payload) => {
  const token = jwt.sign(payload, claveSecreta, { expiresIn: "14d" });
  return token;
};

export const saveMarker = async (req, res) => {
  try {
    const { markerLink, nombre } = req.body;
    const cnn = await connect();

    const markerQuery = `SELECT * FROM marcadores WHERE link = ?`;
    const [markerResult] = await cnn.query(markerQuery, [markerLink]);
    const markerId1 = markerResult[0].id;

    if (markerResult.length > 0) {
      return res
        .status(400)
        .json({
          message: "El marcador ya existe",
          success: false,
          markerId: markerId1,
        });
    }

    const insertMarkerQuery = `INSERT INTO marcadores (nombre, link) VALUES (?, ?)`;
    const [result] = await cnn.query(insertMarkerQuery, [nombre, markerLink]);

    if (result.affectedRows === 1) {
      const [markerId] = await cnn.query(markerQuery, [markerLink]);
      const markerId0 = markerId[0].id;
      return res
        .status(200)
        .json({
          message: "Marcador guardado correctamente",
          success: true,
          markerId: markerId0,
        });
    } else {
      return res
        .status(500)
        .json({
          message: "Error al guardar el marcador",
          success: false,
          markerId: -1,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error en el servidor",
        success: false,
        markerId: -1,
        error: error,
      });
  }
};

export const deleteMarker = async (req, res) => {
  try {
    const cnn = await connect();
    const { markerId } = req.body;

    const markerQuery = `SELECT * FROM marcadores WHERE id = ?`;
    const [markerResult] = await cnn.query(markerQuery, [markerId]);

    if (markerResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Marcador no encontrado", success: false });
    }

    const deleteQuery = `DELETE FROM marcadores WHERE id = ?`;
    const [result] = await cnn.query(deleteQuery, [markerId]);

    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "Marcador eliminado correctamente", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "Error al eliminar el marcador", success: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false, error: error });
  }
};

export const getUserMarkers = async (req, res) => {
  try {
    const email = req.payload.email;

    const cnn = await connect();

    const [result] = await cnn.query(`SELECT id FROM usuarios WHERE email=?`, [
      email,
    ]);
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado", success: false });
    }

    const userId = result[0].id;
    const [idMarkers] = await cnn.query(
      `SELECT marcador_id FROM usuario_marcador WHERE usuario_id=?`,
      [userId]
    );

    if (idMarkers.length === 0) {
      return res
        .status(404)
        .json({ message: "El usuario no tiene marcadores", success: false });
    }

    const markerIds = idMarkers.map((marker) => marker.marcador_id);

    const [markers] = await cnn.query(
      `SELECT * FROM marcadores WHERE id IN (?)`,
      [markerIds]
    );

    if (markers.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron marcadores", success: false });
    }

    return res
      .status(200)
      .json({ message: "Marcadores obtenidos", success: true, markers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false, error });
  }
};

export const linkMarker = async (req, res) => {
  try {
    const { email } = req.payload;
    const { markerId } = req.body;
    const cnn = await connect();

    const [userResult] = await cnn.query(
      `SELECT id FROM usuarios WHERE email=?`,
      [email]
    );
    if (userResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Error: Usuario no encontrado", success: false });
    }
    const userId = userResult[0].id;

    const markerQuery = `SELECT * FROM usuario_marcador WHERE usuario_id = ? AND marcador_id = ?`;
    const [markerResult] = await cnn.query(markerQuery, [userId, markerId]);

    if (markerResult.length > 0) {
      const deleteMarkerQuery = `DELETE FROM usuario_marcador WHERE usuario_id = ? AND marcador_id = ?`;
      await cnn.query(deleteMarkerQuery, [userId, markerId]);
      const checkQuery = `SELECT * FROM usuario_marcador WHERE usuario_id = ? AND marcador_id = ?`;
      const [checkResult] = await cnn.query(checkQuery, [userId, markerId]);

      if (checkResult.length === 0) {
        return res
          .status(200)
          .json({
            message: "Marcador desvinculado correctamente",
            success: true,
          });
      } else {
        return res
          .status(500)
          .json({
            message: "Error al desvincular el marcador",
            success: false,
          });
      }
    }

    const insertMarkerQuery = `INSERT INTO usuario_marcador (usuario_id, marcador_id) VALUES (?, ?)`;
    const [result] = await cnn.query(insertMarkerQuery, [userId, markerId]);

    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "Marcador vinculado correctamente", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "Error al vincular el marcador", success: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false, error: error });
  }
};

export const taskUpload = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { email } = req.payload;
    const cnn = await connect();

    const [userResult] = await cnn.query(
      `SELECT id FROM usuarios WHERE email=?`,
      [email]
    );
    if (userResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Error: Usuario no encontrado", success: false });
    }
    const userId = userResult[0].id;

    const titleQuery = `SELECT * FROM tareas WHERE title = ?`;
    const [markerResult] = await cnn.query(titleQuery, [title]);

    if (markerResult.length > 0) {
      return res
        .status(400)
        .json({ message: "La tarea ya existe", success: false });
    }

    const insertTitleQuery = `INSERT INTO tareas (title, content, userId) VALUES (?, ?, ?)`;
    const [result] = await cnn.query(insertTitleQuery, [
      title,
      content,
      userId,
    ]);

    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "Tarea publicada correctamente", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "Error al publicar la tarea", success: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false, error: error });
  }
};

export const taskDelete = async (req, res) => {
  try {
    const cnn = await connect();
    const { idTask } = req.body;
    const { email } = req.payload;

    const taskQuery = `SELECT * FROM tareas WHERE id = ?`;
    const [taskResult] = await cnn.query(taskQuery, [idTask]);
    if (taskResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Tarea no encontrada", success: false });
    }

    const [userResult] = await cnn.query(
      `SELECT id FROM usuarios WHERE email=?`,
      [email]
    );
    if (userResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Error: Usuario no encontrado", success: false });
    }
    const userId = userResult[0].id;

    const [userRolResult] = await cnn.query(
      `SELECT rol_id FROM usuarios WHERE id=?`,
      [userId]
    );
    const userRol = userRolResult[0].rol_id;

    const [userTaskResult] = await cnn.query(
      `SELECT userId FROM tareas WHERE id=?`,
      [idTask]
    );
    if (userTaskResult.length === 0) {
      return res
        .status(404)
        .json({
          message: "Error: No se encontro el usuario creador.",
          success: false,
        });
    }
    const creatorId = userTaskResult[0].userId;

    let userIsCreator = false;
    if (creatorId == userId) {
      userIsCreator = true;
    }

    if (userRol == 1 || userIsCreator) {
      const deleteQuery = `DELETE FROM tareas WHERE id = ?`;
      const [result] = await cnn.query(deleteQuery, [idTask]);
      if (result.affectedRows === 1) {
        return res
          .status(200)
          .json({ message: "Tarea eliminada correctamente", success: true });
      } else {
        return res
          .status(500)
          .json({
            message: "Error desconocido al eliminar la tarea",
            success: false,
          });
      }
    } else {
      return res
        .status(500)
        .json({
          message: "Error al eliminar la tarea, no tienes permisos",
          success: false,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false, error: error });
  }
};

export const taskEdit = async (req, res) => {
  try {
    const cnn = await connect();
    const { idTask, title, content } = req.body;
    const { email } = req.payload;

    const taskQuery = `SELECT * FROM tareas WHERE id = ?`;
    const [taskResult] = await cnn.query(taskQuery, [idTask]);
    if (taskResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Tarea no encontrada", success: false });
    }

    const [userResult] = await cnn.query(
      `SELECT id FROM usuarios WHERE email=?`,
      [email]
    );
    if (userResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Error: Usuario no encontrado", success: false });
    }
    const userId = userResult[0].id;

    const [userTaskResult] = await cnn.query(
      `SELECT userId FROM tareas WHERE id=?`,
      [idTask]
    );
    const creatorId = userTaskResult[0].userId;

    const userIsCreator = creatorId === userId;
    if (userIsCreator) {
      const updateQuery = `UPDATE tareas SET title = ?, content = ? WHERE id = ?`;
      const [result] = await cnn.query(updateQuery, [title, content, idTask]);

      if (result.affectedRows === 1) {
        return res
          .status(200)
          .json({ message: "Tarea actualizada correctamente", success: true });
      } else {
        return res
          .status(500)
          .json({
            message: "Error desconocido al actualizar la tarea",
            success: false,
          });
      }
    } else {
      return res
        .status(403)
        .json({
          message: "No tienes permisos para editar esta tarea",
          success: false,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false, error });
  }
};

export const getTask = async (req, res) => {
  try {
    const cnn = await connect();
    const idTask = req.headers["task"];
 
    const query = `
      SELECT tareas.title, tareas.content, usuarios.nombre AS creatorName
      FROM tareas
      JOIN usuarios ON tareas.userId = usuarios.id
      WHERE tareas.id = ?
    `;
    const [taskResult] = await cnn.query(query, [idTask]);

    if (taskResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Tarea no encontrada", success: false });
    }

    return res.status(200).json({
      title: taskResult[0].title,
      content: taskResult[0].content,
      creator: taskResult[0].creatorName,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false, error });
  }
};

export const getAllTaskId = async (req, res) => {
  try {
    const cnn = await connect();

    const query = `SELECT id FROM tareas`;
    const [tasksResult] = await cnn.query(query);

    if (tasksResult.length === 0) {
      return res.status(404).json({ message: "No se encontraron tareas", success: false });
    }

    return res.status(200).json({
      taskIds: tasksResult.map((task) => task.id),
      success: true
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor", success: false, error });
  }
};
