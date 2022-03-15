import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"

const checkAuth = async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1] // divide en 2 por el espacio (posicion 0 y 1), y asigna la p1
            
            const decoded = jwt.verify( token, process.env.JWT_SECRET) // verifica que el token sea valido usando la palabra secreta y lo obtiene decodificado
            
            req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v") //-atributo, saca los atributos que no se quieren
            
            return next()

        } catch (error) {
            return res.status(404).json({msg: "Hubo un error"}) // error al comprobar el JW
        }
    }

    if(!token) {
        const error = new Error("Token no válido")
        return res.status(401).json({msg: error.message})
    }

    next()
}

export default checkAuth