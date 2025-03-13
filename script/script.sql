-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.41 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para assembler-world
CREATE DATABASE IF NOT EXISTS `assembler-world` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `assembler-world`;

-- Volcando estructura para tabla assembler-world.marcadores
CREATE TABLE IF NOT EXISTS `marcadores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `link` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla assembler-world.marcadores: ~0 rows (aproximadamente)

-- Volcando estructura para tabla assembler-world.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla assembler-world.roles: ~2 rows (aproximadamente)
INSERT INTO `roles` (`id`, `nombre`) VALUES
	(1, 'Editor'),
	(2, 'Usuario Registrado');

-- Volcando estructura para tabla assembler-world.tareas
CREATE TABLE IF NOT EXISTS `tareas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` varchar(3000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `FK_tareas_usuarios` FOREIGN KEY (`userId`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla assembler-world.tareas: ~2 rows (aproximadamente)
INSERT INTO `tareas` (`id`, `title`, `content`, `userId`) VALUES
	(1, 'Tarea de Prueba Numero 1', 'Hacer tarea, estudiar y hacer mas tarea.', 5),
	(2, 'Tarea de prueba Numero 2', 'Leer la documentacion de ARM y visual.', 5);

-- Volcando estructura para tabla assembler-world.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int DEFAULT (2),
  PRIMARY KEY (`id`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla assembler-world.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`) VALUES
	(5, 'admin', 'admin', '$2b$05$.7UFVFG1NFuDRNOUpucpO.uMQZs38eiYJq18k/0WOEAPf5DtxbBS6', 1),
	(6, 'noAdmin', 'noAdmin', '$2b$05$Y.UyflxHineLRNxfpRLgYuoXoP4RikV8j/wZam1i7dPl8n4OhQdRC', 2);

-- Volcando estructura para tabla assembler-world.usuario_marcador
CREATE TABLE IF NOT EXISTS `usuario_marcador` (
  `usuario_id` int NOT NULL,
  `marcador_id` int NOT NULL,
  PRIMARY KEY (`usuario_id`,`marcador_id`) USING BTREE,
  KEY `FK_usuario_marcador_marcadores` (`marcador_id`),
  CONSTRAINT `FK_usuario_marcador_marcadores` FOREIGN KEY (`marcador_id`) REFERENCES `marcadores` (`id`),
  CONSTRAINT `FK_usuario_marcador_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla assembler-world.usuario_marcador: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
