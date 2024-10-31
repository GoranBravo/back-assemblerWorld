//archivo para manejar las rutas de usuarios

import { Router } from "express";
import { auth, createUsers, deleteMarker, getUserMarkers, logIn, saveMarker, linkMarker, taskUpload, taskDelete, taskEdit, getTask, getAllTaskId} from "../controller/users";

//objeto para manejo de url
const routerUsers = Router();

//Enpoint para loguear usuario
/**
 * @swagger
 * /login:
 *  post:
 *      sumary: loguear usuario
 */
routerUsers.post("/user/login", logIn);

/**
 * @swagger
 * /usersp:
 *  post:
 *      sumary: crea usuarios
 */
routerUsers.post("/user/usersp", createUsers);

/**
 * @swagger
 * /saveMarker:
 *  post:
 *      sumary: save marker
 */
routerUsers.post("/user/saveMarker", auth, saveMarker);

/**
 * @swagger
 * /deleteMarker:
 *  post:
 *      sumary: delete marker
 */
routerUsers.post("/user/deleteMarker", auth, deleteMarker);

/**
 * @swagger
 * /linkMarker:
 *  post:
 *      sumary: link markers
 */
routerUsers.post("/user/linkMarker", auth, linkMarker);

/**
 * @swagger
 * /taskUpload:
 *  post:
 *      sumary: upload task
 */
routerUsers.post("/user/taskUpload", auth, taskUpload);

/**
 * @swagger
 * /taskDelete:
 *  post:
 *      sumary: task delete
 */
routerUsers.post("/user/taskDelete", auth, taskDelete);

/**
 * @swagger
 * /taskEdit:
 *  post:
 *      sumary: task edit
 */
routerUsers.post("/user/taskEdit", auth, taskEdit);

/**
 * @swagger
 * /getUserMarker:
 *  get:
 *      sumary: get markers
 */
routerUsers.get("/user/getMarkers", auth, getUserMarkers);

/**
 * @swagger
 * /getTask:
 *  get:
 *      sumary: get task
 */
routerUsers.get("/user/getTask", getTask);

/**
 * @swagger
 * /getAllTaskId:
 *  get:
 *      sumary: get all tasks id
 */
routerUsers.get("/user/getAllTaskId", getAllTaskId);

export default routerUsers;
