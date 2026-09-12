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
      horariosTexto,
      selectedHourLabels,
      montoTotal,
      cliente,
      horaEncuesta,
    } = reserva;

    const cleanPhone = (cliente.celular || "").replace(/\D/g, "");
    const phoneWithCountry = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;

    const nombreCliente = `${cliente.nombres || ""}`.trim();
    const dniCliente = cliente.dni || "";
    const horarioDisplay = horariosTexto || (selectedHourLabels && selectedHourLabels.length ? selectedHourLabels.join(", ") : `${horaInicio} - ${horaFin || "12:00"}`);

    // 1. Mensaje WhatsApp con la plantilla exacta solicitada por el usuario
    const whatsappMessage = `📌 *¡CONFIRMACIÓN DE RESERVA - ESPACIAPP COWORKING!* 📌

Hola ${nombreCliente}, tu reserva ha sido registrada con éxito.

*DETALLES DE LA RESERVA:*
* *Titular:* ${nombreCliente} (DNI: ${dniCliente})
* *Sede:* ${sedeNombre}
* *Espacio:* ${espacioNombre}
* *Fecha:* ${fecha}
* *Horario:* ${horarioDisplay}
* *Código de Operación:* ${codigoReserva}
* *Monto Total:* S/ ${Number(montoTotal).toFixed(2)}

----------------------------------------
📜 *NORMAS DE USO DEL ESPACIO:*
1. Mantener el volumen de voz bajo en zonas compartidas.
2. Prohibido fumar o vapear dentro de las instalaciones.
3. Consumir alimentos únicamente en la cafetería/lounge.
4. Respetar los horarios de inicio y término de tu reserva.
5. Mantener limpio y ordenado tu espacio al retirarte.

----------------------------------------
💡 *RECOMENDACIONES PARA TU VISITA:*
* Llegar 10 minutos antes para registrar tu ingreso.
* Presentar tu DNI o código ${codigoReserva} en recepción.
* Solicitar en recepción la clave de Wi-Fi (500 Mbps) y disfrutar del café libre.
* Usar audífonos para llamadas en zonas comunes.

Contacto & Soporte Oficial: +51 994 314 523
¡Gracias por reservar con EspaciApp! ☕🚀`;

    // 2. Redacción del Mensaje de Encuesta de Satisfacción (para enviar 10 min tras expirar)
    const surveyMessage = `*HOLA ${cliente.nombres.toUpperCase()} 🌟*
Esperamos que tu jornada en *EspaciApp (${sedeNombre})* haya sido excelente.

Tu reserva finalizó a las ${horaFin}. Nos encantaría conocer tu opinión para seguir mejorando:
⭐ ¿Cómo calificarías tu experiencia del 1 al 5?
💬 ¿Qué podríamos mejorar o implementar para tu próxima visita?

Responde a este mensaje o contáctanos a la Central 994314523. ¡Gracias por formar parte de Surco! 🌿`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsappMessage)}`;
    const surveyUrl = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(surveyMessage)}`;

    // 3. Redacción del Correo Electrónico con la Plantilla Exacta (Texto + HTML)
    const emailSubject = `Confirmación de Reserva ${codigoReserva} - EspaciApp Coworking`;
    
    const emailMessageText = `📌 ¡CONFIRMACIÓN DE RESERVA - ESPACIAPP COWORKING! 📌

Hola ${nombreCliente}, tu reserva ha sido registrada con éxito.

DETALLES DE LA RESERVA:
* Titular: ${nombreCliente} (DNI: ${dniCliente})
* Sede: ${sedeNombre}
* Espacio: ${espacioNombre}
* Fecha: ${fecha}
* Horario: ${horarioDisplay}
* Código de Operación: ${codigoReserva}
* Monto Total: S/ ${Number(montoTotal).toFixed(2)}

----------------------------------------
📜 NORMAS DE USO DEL ESPACIO:
1. Mantener el volumen de voz bajo en zonas compartidas.
2. Prohibido fumar o vapear dentro de las instalaciones.
3. Consumir alimentos únicamente en la cafetería/lounge.
4. Respetar los horarios de inicio y término de tu reserva.
5. Mantener limpio y ordenado tu espacio al retirarte.

----------------------------------------
💡 RECOMENDACIONES PARA TU VISITA:
* Llegar 10 minutos antes para registrar tu ingreso.
* Presentar tu DNI o código ${codigoReserva} en recepción.
* Solicitar en recepción la clave de Wi-Fi (500 Mbps) y disfrutar del café libre.
* Usar audífonos para llamadas en zonas comunes.

Contacto & Soporte Oficial: +51 994 314 523
¡Gracias por reservar con EspaciApp! ☕🚀`;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1d4ed8, #0284c7); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">📌 ¡CONFIRMACIÓN DE RESERVA - ESPACIAPP COWORKING! 📌</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Municipalidad de Santiago de Surco</p>
        </div>

        <div style="padding: 28px;">
          <p style="font-size: 16px; color: #0f172a; margin-top: 0; font-weight: 600;">
            Hola <strong>${nombreCliente}</strong>, tu reserva ha sido registrada con éxito.
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="font-size: 14px; font-weight: 800; color: #1e3a8a; margin: 0 0 12px; text-transform: uppercase;">📋 DETALLES DE LA RESERVA:</h3>
            <ul style="margin: 0; padding: 0; list-style: none; font-size: 13px; color: #334155; line-height: 1.8;">
              <li><strong>• Titular:</strong> ${nombreCliente} (DNI: ${dniCliente})</li>
              <li><strong>• Sede:</strong> ${sedeNombre} (${sedeDireccion})</li>
              <li><strong>• Espacio:</strong> ${espacioNombre}</li>
              <li><strong>• Fecha:</strong> ${fecha}</li>
              <li><strong>• Horario:</strong> ${horarioDisplay}</li>
              <li><strong>• Código de Operación:</strong> <span style="color: #1d4ed8; font-weight: bold;">${codigoReserva}</span></li>
              <li><strong>• Monto Total:</strong> <span style="color: #16a34a; font-weight: bold;">S/ ${Number(montoTotal).toFixed(2)}</span></li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="font-size: 14px; font-weight: bold; color: #14532d; margin: 0 0 10px;">📜 NORMAS DE USO DEL ESPACIO:</h3>
            <ol style="margin: 0; padding-left: 20px; color: #166534; font-size: 13px; line-height: 1.7;">
              <li>Mantener el volumen de voz bajo en zonas compartidas.</li>
              <li>Prohibido fumar o vapear dentro de las instalaciones.</li>
              <li>Consumir alimentos únicamente en la cafetería/lounge.</li>
              <li>Respetar los horarios de inicio y término de tu reserva.</li>
              <li>Mantener limpio y ordenado tu espacio al retirarte.</li>
            </ol>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="font-size: 14px; font-weight: bold; color: #78350f; margin: 0 0 10px;">💡 RECOMENDACIONES PARA TU VISITA:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px; line-height: 1.7;">
              <li>Llegar 10 minutos antes para registrar tu ingreso.</li>
              <li>Presentar tu DNI o código <strong>${codigoReserva}</strong> en recepción.</li>
              <li>Solicitar en recepción la clave de Wi-Fi (500 Mbps) y disfrutar del café libre.</li>
              <li>Usar audífonos para llamadas en zonas comunes.</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">
            <p style="margin: 0 0 6px;"><strong>Contacto & Soporte Oficial:</strong> +51 902 733 255</p>
            <p style="margin: 0; font-weight: bold; color: #0284c7;">¡Gracias por reservar con EspaciApp! ☕🚀</p>
          </div>
        </div>
      </div>
    `;

    const mailtoUrl = `mailto:${cliente.correo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessageText)}`;

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
          mensajeTexto: emailMessageText,
          html: emailHtml,
          mailtoUrl: mailtoUrl,
          estado: "enviado_al_correo",
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
