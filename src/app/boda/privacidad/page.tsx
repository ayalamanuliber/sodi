import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'La prueba y tus datos | SODI Bodas',
  description: 'Qué se guarda, qué se comparte y cómo cuidar el acceso a tu boda.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function WeddingPrivacyPage() {
  return <main className={styles.page}>
    <article className={styles.article}>
      <Link className={styles.brand} href="/boda" prefetch={false}>SODI <span>BODAS</span></Link>
      <p className={styles.eyebrow}>La prueba y tus datos · 8 de septiembre de 2026</p>
      <h1>Su boda, con las cosas claras.</h1>
      <p className={styles.lead}>Antes de cargar una lista o compartir una invitación, esto es lo que conviene saber.</p>

      <section><h2>Qué incluye esta prueba</h2>
        <p>Crear y editar una invitación, guardar su diseño y sus fotos, organizar invitados y mesas, publicar un enlace y recibir confirmaciones. El sistema admite hasta 200 personas y seis fotos de invitación por boda.</p>
        <p>La prueba del core es gratuita y no pide una tarjeta. Fotos por QR, álbum de invitados y otros extras en investigación no están incluidos ni disponibles para contratar desde este sistema.</p>
        <p>El acceso inicial tiene un cupo de bodas. Si se completa, se detienen las nuevas altas; eso no bloquea las respuestas de una boda ya creada.</p>
      </section>

      <section><h2>El borrador y la boda guardada son distintos</h2>
        <p>La demostración de diseño guarda un borrador en ese navegador durante siete días. Crear una boda la guarda en el servidor. Cerrar una pestaña no borra una boda creada.</p>
        <p>Los cambios se guardan cuando el panel lo confirma. Si aparece un error, no los des por guardados. Editar el borrador tampoco cambia una invitación publicada: hay que volver a publicarla.</p>
      </section>

      <section><h2>Qué puede ver cada persona</h2>
        <p>Una invitación publicada puede verla quien tenga su enlace, incluidas sus fotos, fecha y lugares. No publiques información que no quieras compartir. Podés despublicarla desde el panel.</p>
        <p>La lista completa, la organización y el panel requieren acceso a la boda. Un enlace de confirmación permite consultar y responder por el grupo al que pertenece; cuidalo como una invitación personal y renovalo si se compartió por error.</p>
        <p>Excluimos invitaciones y paneles de la indexación de buscadores. Eso no impide que alguien reenvíe un enlace o haga una captura.</p>
      </section>

      <section><h2>Cargar sólo lo necesario</h2>
        <p>Usá fotos que puedas compartir y cargá los datos necesarios para organizar la celebración. No incluyas documentos, datos de pago ni información ajena a la boda.</p>
        <p>Las preferencias alimentarias y las necesidades de acceso son opcionales. Pedí esa información a la persona correspondiente; no deduzcas diagnósticos. Una restricción alimentaria sólo se incluye en la exportación para catering cuando está habilitado compartirla. Las notas privadas quedan fuera de las exportaciones para salón y catering.</p>
      </section>

      <section><h2>Acceso y copias</h2>
        <p>Guardá el enlace del panel y elegí una contraseña que no uses en otro servicio. El comprobante de recuperación permite restablecer el acceso: conservá una copia en un lugar seguro y no lo compartas con los invitados.</p>
        <p>Podés descargar una copia desde el panel. Ese archivo puede contener nombres, fotos y respuestas; guardalo fuera de carpetas públicas. Compartir una copia comparte también esos datos.</p>
      </section>

      <section><h2>Almacenamiento y duración</h2>
        <p>En el servicio alojado usamos almacenamiento privado de Vercel para los datos de cada boda. Las fotos de una invitación se entregan a través de SODI cuando esa invitación está publicada. Las contraseñas y claves de recuperación se conservan como verificadores, no como texto legible.</p>
        <p>Esta beta no ofrece una garantía de alojamiento permanente. Actualmente no hay borrado automático por inactividad; conservá una copia propia. Podés eliminar la boda desde el panel con tu contraseña: se retiran la invitación, las fotos, las personas, las respuestas y las versiones guardadas. Los archivos que hayas descargado o compartido quedan bajo tu cuidado.</p>
        <p>Para resolver un problema con tus datos, escribí a <a href="mailto:hola@sodi.com.ar">hola@sodi.com.ar</a> indicando el enlace de tu panel, sin enviar contraseñas ni claves. Debemos verificar que la solicitud corresponde a quien administra la boda.</p>
      </section>

      <section><h2>Medición y consultas</h2>
        <p>La landing puede medir visitas e interacciones comerciales. Los paneles y las invitaciones no cargan los rastreadores de publicidad ni de analítica del sitio. El servidor conserva registros operativos para acceso, guardado y control de intentos; no son una autorización para enviar publicidad a los invitados.</p>
        <p>Si algo falla, describí el paso y el mensaje que apareció en <a href="mailto:hola@sodi.com.ar">hola@sodi.com.ar</a>. Evitá adjuntar listas o datos de invitados cuando no sean necesarios para explicar el problema.</p>
      </section>
      <Link className={styles.back} href="/boda/empezar" prefetch={false}>Volver a crear nuestra boda <span aria-hidden="true">↗</span></Link>
    </article>
  </main>;
}
