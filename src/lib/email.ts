// ============================================
// VALIDACIÓN DE EMAIL DESHABILITADA TEMPORALMENTE
// Para habilitar: importar Resend y configurar API key
// ============================================

// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'Inventario Next <noreply@tu-dominio.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendActivationEmailParams {
  email: string;
  name: string;
  companyCode: string;
  activationToken: string;
}

export async function sendActivationEmail({
  email,
  name,
  companyCode,
  activationToken,
}: SendActivationEmailParams) {
  const activationUrl = `${APP_URL}/activate?token=${activationToken}`;

  // ============================================
  // MODO TEMPORAL: Solo loguea sin enviar email
  // ============================================
  console.log('📧 [MODO PRUEBA] Email de activación (NO ENVIADO):');
  console.log('   Para:', email);
  console.log('   Nombre:', name);
  console.log('   Código:', companyCode);
  console.log('   URL de activación:', activationUrl);

  return { 
    success: true, 
    data: { 
      id: 'mock-email-id',
      from: FROM_EMAIL,
      to: email,
      message: 'Email validation disabled - mock response'
    } 
  };
}
