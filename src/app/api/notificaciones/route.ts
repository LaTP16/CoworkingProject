import { NextResponse } from "next/server";

const REGLAS_COWORKING = [
  "1. Zona de Concentración: Mantén tus dispositivos en silencio. Para llamadas de voz o videollamadas prolongadas, utiliza exclusivamente las cabinas telefónicas insonorizadas o salas privadas.",
  "2. Cuidado de Instalaciones: Respeta los escritorios ergonómicos, monitores y tomas de corriente de 220V.",
  "3. Servicios Compartidos: Disfruta del café de especialidad, infusiones y agua purificada ilimitada manteniendo limpia el área de cafetería.",
  "4. Control de Aforo y Salida: Respeta la hora de término de tu reserva para permitir la desinfección y el ingreso puntual del siguiente usuario.",
  "5. Identificación Municipal: Presenta tu DNI en la recepción de la sede al momento de ingresar para validar tu beneficio de vecino o tu reserva.",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reserva } = body;

    if (!reserva) {
      return NextResponse.json(
        { error: "Datos de reserva requeridos" },
        { status: 400 }
      );
    }

    const {
      codigoReserva,
      sedeNombre,
      sedeDireccion,
      espacioNombre,
      fecha,
      horaInicio,
      horaFin,
      duracionHoras,
      montoTotal,
      cliente,
      horaEncuesta,
    } = reserva;

    // 1. Redacción del Mensaje de WhatsApp de Confirmación + Reglas
    const whatsappMessage = `*¡HOLA ${cliente.nombres.toUpperCase()}! 👋*
Tu reserva en *EspaciApp Coworking - Municipalidad de Surco* ha sido confirmada con éxito.

📌 *DETALLES DE TU RESERVA:*
• *Código:* ${codigoReserva}
• *Sede:* ${sedeNombre} (${sedeDireccion})
• *Espacio:* ${espacioNombre}
• *Fecha:* ${fecha}
• *Horario:* ${horaInicio} a ${horaFin} (${duracionHoras} hrs)
• *Total Pagado:* S/ ${Number(montoTotal).toFixed(2)}

📜 *REGLAS DE CONVIVENCIA:*
1. Mantén tus llamadas en cabinas insonorizadas.
2. Cuida el mobiliario y las conexiones eléctricas.
3. Café de especialidad y Wi-Fi 500 Mbps ilimitados.
4. Presenta tu DNI en recepción al llegar.

¡Te esperamos en Surco para una jornada súper productiva! ☕🚀`;

    // 2. Redacción del Mensaje de Encuesta de Satisfacción (para enviar 10 min tras expirar)
    const surveyMessage = `*HOLA ${cliente.nombres.toUpperCase()} 🌟*
Esperamos que tu jornada en *EspaciApp (${sedeNombre})* haya sido excelente.

Tu reserva finalizó a las ${horaFin}. Nos encantaría conocer tu opinión para seguir mejorando:
⭐ ¿Cómo calificarías tu experiencia del 1 al 5?
💬 ¿Qué podríamos mejorar o implementar para tu próxima visita?

Responde directamente a este mensaje. ¡Gracias por formar parte de la comunidad de Surco! 🌿`;

    const cleanPhone = (cliente.celular || "").replace(/\D/g, "");
    const phoneWithCountry = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(whatsappMessage)}`;
    const surveyUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(surveyMessage)}`;

    // 3. Redacción del Correo Electrónico HTML Corporativo
    const emailSubject = `Confirmación de Reserva ${codigoReserva} - EspaciApp Coworking Surco`;
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1d4ed8, #0284c7); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">EspaciApp Surco</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Red Municipal de Espacios Coworking</p>
          <div style="display: inline-block; margin-top: 16px; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            Reserva Confirmada: ${codigoReserva}
          </div>
        </div>

        <div style="padding: 24px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">¡Hola ${cliente.nombres}!</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Tu reserva ha sido procesada y registrada en el sistema de gestión de EMUSS en tiempo real. Aquí tienes tu comprobante oficial:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: bold; color: #334155;">Sede:</td>
              <td style="padding: 10px; color: #0f172a;">${sedeNombre} (${sedeDireccion})</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: bold; color: #334155;">Espacio:</td>
              <td style="padding: 10px; color: #0f172a;">${espacioNombre}</td>
            </tr>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: bold; color: #334155;">Fecha y Horario:</td>
              <td style="padding: 10px; color: #0f172a;">${fecha} | ${horaInicio} - ${horaFin} (${duracionHoras} hrs)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; font-weight: bold; color: #334155;">Monto Total Pagado:</td>
              <td style="padding: 10px; font-weight: bold; color: #16a34a;">S/ ${Number(montoTotal).toFixed(2)}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; color: #334155;">DNI de Acceso:</td>
              <td style="padding: 10px; color: #0f172a;">${cliente.dni}</td>
            </tr>
          </table>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <h3 style="font-size: 14px; font-weight: bold; color: #1e40af; margin: 0 0 8px;">Reglamento Oficial de Convivencia Coworking</h3>
            <ul style="margin: 0; padding-left: 18px; color: #1e3a8a; font-size: 12px; line-height: 1.7;">
              ${REGLAS_COWORKING.map((r) => `<li>${r}</li>`).join("")}
            </ul>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
            A las ${horaEncuesta} (10 minutos después de expirar tu reserva) te enviaremos una breve encuesta para evaluar tu experiencia.
          </p>
        </div>
      </div>
    `;

    return NextResponse.json({
      success: true,
      notificaciones: {
        whatsapp: {
          destinatario: cliente.celular,
          mensaje: whatsappMessage,
          url: whatsappUrl,
        },
        survey: {
          horaProgramada: horaEncuesta,
          mensaje: surveyMessage,
          url: surveyUrl,
        },
        email: {
          destinatario: cliente.correo,
          asunto: emailSubject,
          html: emailHtml,
          estado: "generado_y_listo",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error procesando notificaciones", details: error.message },
      { status: 500 }
    );
  }
}
