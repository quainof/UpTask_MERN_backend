import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"

// Agregar tarea
const agregarTarea = async (req, res) => {
    const { proyecto } = req.body

    const existeProyecto = await Proyecto.findById(proyecto)

    if(!existeProyecto){
        const error = new Error("El proyecto no existe")
        return res.status(404).json({msg: error.message})
    }

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("No tienes los permisos para añadir tareas")
        return res.status(403).json({msg: error.message})
    }

    try {
        // Almacenar tarea
        const tareaAlmacenada = await Tarea.create(req.body)

        // Almacenar el id en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

// Obtener una tarea
const obtenerTarea = async (req, res) => {
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate("proyecto") // populate le agrega la info del proyecto a la tarea
    // MENOS EFICIENTE: una opcion es extraer el id proyecto de tarea, consultar el proyecto y asi obtener el creador
    
    if(!tarea){
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({msg: error.message})    
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(403).json({msg: error.message})
    }

    res.send(tarea)
}

// Editar una tarea
const actualizarTarea = async (req, res) => {
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate("proyecto") // populate le agrega la info del proyecto a la tarea
    // MENOS EFICIENTE: una opcion es extraer el id proyecto de tarea, consultar el proyecto y asi obtener el creador
    
    if(!tarea){
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({msg: error.message})    
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(403).json({msg: error.message})
    }

    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

// Eliminar tarea
const eliminarTarea = async (req, res) => {
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate("proyecto") // populate le agrega la info del proyecto a la tarea
    // MENOS EFICIENTE: una opcion es extraer el id proyecto de tarea, consultar el proyecto y asi obtener el creador
    
    if(!tarea){
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({msg: error.message})    
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Acción no válida")
        return res.status(403).json({msg: error.message})
    }

    try {

        // Obtener el proyecto para eliminar la tarea de su arreglo de tareas
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)

        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        
        res.json({msg: "La tarea se eliminó correctamente"})
        
    } catch (error) {
        console.log(error)
    }
}


// Cambiar estado de la tarea
const cambiarEstado = async (req, res) => {
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate("proyecto") // populate le agrega la info del proyecto a la tarea
    
    if(!tarea){
        const error = new Error("Tarea no encontrada")
        return res.status(404).json({msg: error.message})    
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()
    && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
    ){
        const error = new Error("Acción no válida")
        return res.status(403).json({msg: error.message})
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    // hacer populate para que aparezca el que la completo desde un principio
    const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado")
    res.json(tareaAlmacenada)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}