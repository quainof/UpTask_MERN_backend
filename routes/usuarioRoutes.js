import express from "express"
const router = express.Router()

import { 
    registrar, 
    autenticar, 
    confirmar, 
    olvidePassword, 
    comprobarToken,
    nuevoPassword,
    perfil
} from "../controllers/usuarioController.js"

import checkAuth from "../middleware/checkAuth.js"

// Autenticación, registro y confirmación de usuarios
router.post("/", registrar) // Crea un nuevo usuario
router.post("/login", autenticar) // Iniciar sesión generando el jwt
router.get("/confirmar/:token", confirmar) // Confirmar cuenta
router.post("/olvide-password", olvidePassword) // recuperar contraseña
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)  // comprueba que el usuario sea válido para recuperar su contraseña // generar nuevo password
router.get("/perfil", checkAuth, perfil)

export default router