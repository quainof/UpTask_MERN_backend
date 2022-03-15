import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"
import Usuario from "../models/Usuario.js"

// Obtener todos los proyectos
const obtenerProyectos = async (req, res) => {

    const proyectos = await Proyecto.find({
        '$or' : [
            {"colaboradores": {$in: req.usuario}},
            {"creador": {$in: req.usuario}}
        ] 
        // Tiene que cumplir una de las condiciones, anteriormente para uno solo era .where("creador").equals(req.usuario)
    }).select("-tareas")

    res.json(proyectos)
}

// Crear proyecto
const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

// Obtener un proyecto en específico junto a sus tareas
const obtenerProyecto = async (req, res) => {
    const { id } = req.params

    const proyecto = await Proyecto.findById(id)
        .populate({path: "tareas", populate: {path: "completado", select: "nombre"}}) // populate a tareas y despues a completado
        .populate("colaboradores", "nombre email") // colocar los atributos que quiero, id viene por defecto

    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString() 
    && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
    ){
        const error = new Error("Acción no válida")
        return res.status(404).json({msg: error.message})
    }

    // Tenes que ser el creador del proyecto o colaborador

    
    return res.json(proyecto)
}

// Editar proyecto
const editarProyecto = async (req, res) => {
    const { id } = req.params
    
    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json({msg: error.message})
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre // aca se pasan de a uno por si no hay alguno en el body
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion // pero en el state de react va a estar todo
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

// Eliminar proyecto
const eliminarProyecto = async (req, res) => {
    const { id } = req.params
    
    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json({msg: error.message})
    }

    try {

        await proyecto.deleteOne()
        res.json({msg: "Proyecto eliminado"})

    } catch (error) {
        console.log(error)
    }
}


// Buscar colaborador
const buscarColaborador = async (req, res) => {
    const { email } = req.body
    
    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v")

    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message})
    }

    res.json(usuario)
}
    
// Agregar colaborador
const agegarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    // El proyecto existe y es el mismo creador
    if(!proyecto){
        const error = new Error("Proyecto No Encontrado")
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json({msg: error.message})        
    }

    // Obtener el usuario
    const { email } = req.body
    
    const usuario = await Usuario.findOne({email}).select("-confirmado -createdAt -password -token -updatedAt -__v")

    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message})
    }

    // El colaborador no es el administrador
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error("El creador del proyecto no puede ser colaborador")
        return res.status(404).json({msg: error.message})        
    }

    // Revisar que no este ya agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error("El usuario ya pertenece al proyecto")
        return res.status(404).json({msg: error.message})   
    }

    // Esta bien, se puede agregar
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg: "Colaborador agregado correctamente"})
}

// Eliminar colaborador
const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    // El proyecto existe y es el mismo creador
    if(!proyecto){
        const error = new Error("Proyecto No Encontrado")
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(404).json({msg: error.message})        
    }

    // Esta bien, se puede eliminar
    proyecto.colaboradores.pull(req.body.id)

    await proyecto.save()
    res.json({msg: "Colaborador eliminado correctamente"})
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agegarColaborador,
    eliminarColaborador
}