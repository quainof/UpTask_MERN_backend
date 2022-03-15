import mongoose from "mongoose"
import bcrypt from "bcrypt"

// Estructura de la clase
const usuarioSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true       
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }, 
},
    {
        timestamps: true // Agrega fecha de creación y modificación
    }
)

// Hashear la contraseña, se ejecuta antes de almacenar el registro en la db
usuarioSchema.pre("save", async function(next) {
    if(!this.isModified("password")){ // ignora lo ya hasheado (modificado)
        next() // si no esta modificando la contraseña que no hashee lo que ya esta hasheado o se pierde todo, next pasa al siguiente middleware, no se usa return porque frena todo.
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Comprobar contraseña
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)
}

// Exportar el modelo
const Usuario = mongoose.model("Usuario", usuarioSchema)
export default Usuario