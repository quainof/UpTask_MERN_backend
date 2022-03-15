import nodemailer from "nodemailer"

//* EMAIL PARA REGISTRO
export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos

    // Integración de nodemailer
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    })

    // Información del email

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask- Confirma tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html:`
            <p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
            <p>Tu cuetna ya está casi lista, solo debes comprobarla con el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
            <p>Si no creaste esta cuenta puedes ignorar el mensaje</p>
        `
    })
}




//* EMAIL PARA OLVIDE MI CONTRASEÑA
export const emailOlvidePassword = async (datos) => {
    const { email, nombre, token } = datos

    // Integración de nodemailer
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    })

    // Información del email

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask- Reestablece tu password",
        text: "Reestablece tu password",
        html:`
            <p>Hola: ${nombre} has solicitado reestablecer tu contraseña</p>
            <p>Sigue el siguiente enlace para generar un nuevo password:</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
            <p>Si no solicitaste este cambio puedes ignorar el mensaje</p>
        `
    })
}
