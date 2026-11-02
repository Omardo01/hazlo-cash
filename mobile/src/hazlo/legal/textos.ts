/**
 * Textos legales de Hazlo Cash, transcritos tal cual de los PDF que entregó el
 * área legal (Downloads/Aviso de Privacidad.pdf, Contrato Influecer.pdf y
 * Contratro Negocios.pdf). No se corrige la redacción aquí: cualquier cambio
 * pasa primero por el documento original.
 *
 * `version` identifica el texto que acepta cada usuario al registrarse: si el
 * contenido cambia, sube la versión para poder pedir la aceptación de nuevo.
 */

export type BloqueLegal = { tipo: 'parrafo'; texto: string } | { tipo: 'lista'; items: string[] };

export interface SeccionLegal {
  titulo?: string;
  bloques: BloqueLegal[];
}

export type SlugLegal = 'privacidad' | 'recomendadores' | 'negocios';

export interface DocumentoLegal {
  slug: SlugLegal;
  titulo: string;
  corto: string;
  resumen: string;
  version: string;
  actualizado: string;
  secciones: SeccionLegal[];
}

const p = (texto: string): BloqueLegal => ({ tipo: 'parrafo', texto });
const lista = (...items: string[]): BloqueLegal => ({ tipo: 'lista', items });

const CORREO_PRIVACIDAD = 'privacidad@hazlocash.com.mx';

const AVISO_PRIVACIDAD: DocumentoLegal = {
  slug: 'privacidad',
  titulo: 'Aviso de Privacidad Integral',
  corto: 'Aviso de privacidad',
  resumen: 'Qué datos tuyos guardamos, para qué los usamos y cómo ejercer tus derechos ARCO.',
  version: '2026-10-08',
  actualizado: '8 de octubre de 2026',
  secciones: [
    {
      bloques: [
        p('HAZLO CASH, S.A. de C.V., sociedad mercantil constituida conforme a las leyes de los Estados Unidos Mexicanos, con domicilio en calle Hidalgo # 212, colonia Gil y Sáenz, Villahermosa, Tabasco, México, código postal 86080, en adelante denominada “HAZLO CASH” o “EL RESPONSABLE”, es responsable del tratamiento, uso, almacenamiento, conservación y protección de los datos personales recabados a través de su plataforma digital, disponible en https://www.hazlocash.com, así como de sus aplicaciones móviles y servicios tecnológicos asociados.'),
        p('HAZLO CASH reconoce y respeta el derecho fundamental de toda persona a la protección de sus datos personales, comprometiéndose a realizar su tratamiento de manera lícita, transparente, responsable y conforme a la legislación mexicana vigente.'),
      ],
    },
    {
      titulo: 'SEGUNDA',
      bloques: [
        p('El presente Aviso de Privacidad se emite en cumplimiento de los artículos 6 y 16 de la Constitución Política de los Estados Unidos Mexicanos y de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, publicada en el Diario Oficial de la Federación el 20 de marzo de 2025, así como de las disposiciones reglamentarias y administrativas aplicables.'),
        p('HAZLO CASH observará los principios de licitud, finalidad, lealtad, consentimiento, calidad, proporcionalidad, información y responsabilidad, así como los deberes de seguridad y confidencialidad previstos por la legislación.'),
      ],
    },
    {
      titulo: 'TERCERA',
      bloques: [
        p('Para el funcionamiento de la plataforma, HAZLO CASH podrá recabar, según corresponda, las siguientes categorías de datos personales:'),
        p('A. Datos de identificación y contacto'),
        lista(
          'Nombre completo.',
          'Número telefónico.',
          'Correo electrónico.',
          'Domicilio, cuando resulte necesario.',
          'Código personal de afiliado o identificador único.',
          'Información necesaria para verificar la identidad del usuario.',
        ),
        p('B. Datos financieros, patrimoniales y fiscales'),
        lista(
          'Nombre del titular de la cuenta bancaria.',
          'Institución bancaria.',
          'Clave Bancaria Estandarizada (CLABE).',
          'Información relacionada con comisiones, pagos y beneficios económicos.',
          'Registro Federal de Contribuyentes (RFC), cuando resulte necesario.',
          'Información fiscal requerida para cumplir obligaciones legales.',
        ),
        p('C. Datos relacionados con la actividad comercial'),
        lista(
          'Recomendaciones realizadas.',
          'Códigos o enlaces de referido.',
          'Operaciones comerciales atribuidas a recomendaciones.',
          'Comisiones generadas, pendientes, pagadas o canceladas.',
          'Historial de participación en la plataforma.',
          'Solicitudes, aclaraciones y comunicaciones relacionadas con los servicios.',
        ),
        p('D. Datos tecnológicos y de navegación'),
        lista(
          'Dirección IP.',
          'Tipo de dispositivo.',
          'Navegador y sistema operativo.',
          'Identificadores de sesión.',
          'Registros de acceso y actividad.',
          'Cookies y tecnologías similares.',
        ),
        p('HAZLO CASH no solicitará datos personales sensibles como requisito ordinario de afiliación. Cuando excepcionalmente resulte indispensable recabarlos, informará previamente al titular y solicitará el consentimiento legalmente exigible.'),
      ],
    },
    {
      titulo: 'CUARTA. FINALIDADES PRIMARIAS DEL TRATAMIENTO',
      bloques: [
        p('Los datos personales serán utilizados para las siguientes finalidades necesarias para establecer, mantener y administrar la relación jurídica y comercial entre HAZLO CASH y sus usuarios:'),
        p('I. Registrar, identificar y autenticar a los usuarios de la plataforma.'),
        p('II. Crear, administrar y mantener cuentas de afiliados, recomendadores y negocios participantes.'),
        p('III. Permitir que los usuarios recomienden productos o servicios ofrecidos por los negocios afiliados.'),
        p('IV. Registrar, verificar y validar las recomendaciones efectuadas mediante la plataforma.'),
        p('V. Determinar, calcular y administrar las comisiones, incentivos y beneficios económicos derivados de operaciones válidas.'),
        p('VI. Procesar pagos y transferencias bancarias a los usuarios que hayan generado comisiones conforme a los términos y condiciones aplicables.'),
        p('VII. Prevenir, detectar e investigar posibles fraudes, suplantaciones de identidad, registros duplicados y operaciones irregulares.'),
        p('VIII. Proporcionar atención al usuario, asistencia técnica y seguimiento de aclaraciones.'),
        p('IX. Enviar comunicaciones relacionadas con operaciones, pagos, seguridad, modificaciones contractuales y funcionamiento de los servicios.'),
        p('X. Cumplir las obligaciones fiscales, administrativas, comerciales y legales que resulten aplicables.'),
        p('XI. Conservar los registros necesarios para acreditar operaciones, atender reclamaciones y ejercer o defender derechos.'),
        p('Los datos personales no serán utilizados para finalidades incompatibles con las aquí descritas sin cumplir previamente los requisitos legales correspondientes.'),
      ],
    },
    {
      titulo: 'QUINTA. FINALIDADES SECUNDARIAS',
      bloques: [
        p('Adicionalmente, HAZLO CASH podrá utilizar datos personales para:'),
        p('I. Enviar publicidad y promociones relacionadas con productos, servicios y campañas comerciales.'),
        p('II. Realizar encuestas de satisfacción.'),
        p('III. Elaborar estudios de mercado y estadísticas de participación.'),
        p('IV. Desarrollar programas de fidelización.'),
        p('V. Personalizar comunicaciones comerciales de acuerdo con las preferencias de los usuarios.'),
        p('Estas finalidades no son indispensables para mantener la relación comercial.'),
        p(`El titular podrá negarse al tratamiento de sus datos para dichas finalidades o solicitar posteriormente su exclusión mediante el correo electrónico: ${CORREO_PRIVACIDAD}`),
        p('La negativa no será motivo para impedir el acceso a los servicios principales de la plataforma.'),
      ],
    },
    {
      titulo: 'SEXTA. TRATAMIENTO DE DATOS FINANCIEROS Y PAGO DE COMISIONES',
      bloques: [
        p('HAZLO CASH podrá solicitar datos bancarios y fiscales únicamente cuando sean necesarios para procesar pagos, comisiones, incentivos u otras contraprestaciones económicas generadas legítimamente mediante la plataforma.'),
        p('El tratamiento de datos financieros o patrimoniales se realizará mediante consentimiento expreso cuando así lo exija la legislación aplicable.'),
        p('HAZLO CASH no utilizará la información bancaria para solicitar créditos a nombre de los usuarios, efectuar cargos no autorizados ni contratar productos financieros ajenos a las finalidades informadas.'),
        p('Los datos necesarios para efectuar pagos podrán ser comunicados a instituciones bancarias o proveedores de procesamiento de pagos, observando las disposiciones aplicables en materia de protección de datos personales.'),
        p('La participación en HAZLO CASH no constituye por sí misma una relación de inversión, captación de ahorro, préstamo o intermediación financiera.'),
      ],
    },
    {
      titulo: 'SÉPTIMA. TRANSFERENCIAS Y REMISIONES DE DATOS PERSONALES',
      bloques: [
        p('HAZLO CASH no venderá ni comercializará bases de datos personales de sus usuarios, sin embargo, determinados datos podrán comunicarse a terceros cuando resulte necesario para cumplir las finalidades informadas, incluyendo:'),
        p('I. Instituciones financieras y procesadores de pago, para efectuar las operaciones económicas correspondientes.'),
        p('II. Autoridades fiscales, administrativas o judiciales, cuando exista una obligación legal o requerimiento válido.'),
        p('III. Proveedores de infraestructura tecnológica, alojamiento de información, seguridad informática y servicios operativos que actúen por cuenta de HAZLO CASH.'),
        p('IV. Negocios afiliados, exclusivamente cuando sea necesario para validar recomendaciones, verificar operaciones o cumplir relaciones contractuales.'),
        p('Cuando una transferencia requiera consentimiento, HAZLO CASH deberá obtenerlo previamente, salvo los supuestos de excepción previstos legalmente.'),
        p('Los proveedores que actúen como encargados del tratamiento deberán cumplir obligaciones de confidencialidad y seguridad, y tratar los datos conforme a las instrucciones de HAZLO CASH.'),
      ],
    },
    {
      titulo: 'OCTAVA. CONFIDENCIALIDAD Y SEGURIDAD DE LA INFORMACIÓN',
      bloques: [
        p('HAZLO CASH adoptará medidas administrativas, técnicas y físicas razonables y apropiadas para proteger los datos personales contra pérdida, destrucción, alteración, acceso no autorizado, divulgación o tratamiento indebido.'),
        p('El acceso a la información estará limitado al personal y proveedores autorizados que necesiten conocerla para desempeñar sus funciones.'),
        p('Las personas que intervengan en el tratamiento de datos personales estarán sujetas al deber de confidencialidad, incluso después de concluir su relación con HAZLO CASH.'),
        p('En caso de producirse una vulneración de seguridad que afecte significativamente los derechos patrimoniales o morales de los titulares, HAZLO CASH realizará las comunicaciones legalmente exigibles.'),
        p('La existencia de riesgos tecnológicos, ataques informáticos o acontecimientos extraordinarios no implicará una exención automática de las responsabilidades que legalmente correspondan a HAZLO CASH.'),
      ],
    },
    {
      titulo: 'NOVENA. DERECHOS DE ACCESO, RECTIFICACIÓN, CANCELACIÓN Y OPOSICIÓN (ARCO)',
      bloques: [
        p('Los titulares podrán ejercer los siguientes derechos:'),
        p('Acceso: conocer qué datos personales posee HAZLO CASH y las condiciones de su tratamiento.'),
        p('Rectificación: solicitar la corrección de datos personales inexactos, incompletos o desactualizados.'),
        p('Cancelación: solicitar la cancelación de sus datos personales cuando legalmente proceda.'),
        p('Oposición: oponerse al tratamiento de sus datos personales en los supuestos establecidos por la legislación.'),
        p(`Para ejercer cualquiera de estos derechos, el titular deberá enviar una solicitud al correo electrónico: ${CORREO_PRIVACIDAD}`),
        p('La solicitud deberá contener:'),
        p('I. Nombre completo y medio para recibir notificaciones.'),
        p('II. Documentos que acrediten la identidad del titular o, en su caso, su representación legal.'),
        p('III. Descripción clara de los datos personales respecto de los cuales pretende ejercer algún derecho.'),
        p('IV. Indicación del derecho que desea ejercer o de la petición concreta.'),
        p('V. Cualquier información adicional que facilite la localización de sus datos.'),
        p('En solicitudes de rectificación deberán indicarse las modificaciones solicitadas y acompañarse, cuando corresponda, los documentos que las sustenten.'),
        p('HAZLO CASH comunicará la determinación adoptada dentro de un plazo máximo de veinte días, contado a partir del día siguiente a la recepción de la solicitud, con las posibilidades de ampliación legalmente previstas.'),
        p('Cuando resulte procedente, el derecho solicitado se hará efectivo dentro de los quince días siguientes a la notificación de la respuesta.'),
        p('El ejercicio de los derechos ARCO será gratuito, sin perjuicio de los costos legalmente permitidos.'),
      ],
    },
    {
      titulo: 'DÉCIMA. REVOCACIÓN DEL CONSENTIMIENTO',
      bloques: [
        p('El titular podrá revocar el consentimiento otorgado para el tratamiento de sus datos personales cuando legalmente resulte procedente.'),
        p(`La solicitud deberá enviarse a: ${CORREO_PRIVACIDAD}`),
        p('La revocación no tendrá efectos retroactivos ni impedirá aquellos tratamientos que deban continuar por obligaciones legales, contractuales o por excepciones previstas en la legislación.'),
        p('Cuando la revocación afecte información indispensable para prestar un servicio, HAZLO CASH informará al titular sobre las consecuencias correspondientes.'),
      ],
    },
    {
      titulo: 'DÉCIMA PRIMERA. LIMITACIÓN DEL USO Y DIVULGACIÓN',
      bloques: [
        p('Los titulares podrán solicitar que sus datos personales no sean utilizados para finalidades secundarias, especialmente publicidad, promociones, encuestas comerciales y comunicaciones no indispensables.'),
        p(`Las solicitudes deberán dirigirse a: ${CORREO_PRIVACIDAD}`),
        p('HAZLO CASH implementará mecanismos internos para registrar y atender dichas solicitudes conforme a la legislación aplicable.'),
      ],
    },
    {
      titulo: 'DÉCIMA SEGUNDA. COOKIES Y TECNOLOGÍAS DE SEGUIMIENTO',
      bloques: [
        p('La plataforma podrá utilizar cookies, identificadores de sesión y tecnologías similares para:'),
        p('I. Mantener sesiones activas.'),
        p('II. Facilitar el acceso y funcionamiento de los servicios.'),
        p('III. Prevenir accesos no autorizados.'),
        p('IV. Verificar recomendaciones y operaciones.'),
        p('V. Analizar el funcionamiento de la plataforma.'),
        p('VI. Mejorar la experiencia de navegación.'),
        p('Cuando se utilicen tecnologías para publicidad personalizada u otras finalidades que requieran consentimiento, se informará al usuario y se habilitarán los mecanismos correspondientes.'),
        p('Los usuarios podrán administrar determinadas cookies desde la configuración de su navegador, considerando que su desactivación podría afectar algunas funcionalidades.'),
      ],
    },
    {
      titulo: 'DÉCIMA TERCERA. CONSERVACIÓN Y SUPRESIÓN DE DATOS',
      bloques: [
        p('HAZLO CASH conservará los datos personales únicamente durante el tiempo necesario para cumplir las finalidades que motivaron su recopilación, así como los plazos derivados de obligaciones fiscales, contractuales, administrativas o legales.'),
        p('Una vez concluidas las finalidades y transcurridos los plazos aplicables, los datos serán suprimidos, previo bloqueo cuando legalmente corresponda, o sometidos a procesos de disociación que impidan identificar a sus titulares.'),
        p('La cancelación de una cuenta no implicará necesariamente la eliminación inmediata de todos los registros cuando exista una obligación legal que justifique su conservación.'),
      ],
    },
    {
      titulo: 'DÉCIMA CUARTA. DATOS PERSONALES DE TERCEROS Y PERSONAS RECOMENDADAS',
      bloques: [
        p('Los usuarios que participen en programas de recomendación deberán respetar la privacidad de las personas a quienes recomienden productos o servicios.'),
        p('Los recomendadores no deberán proporcionar datos personales de terceros sin contar con una base legítima para hacerlo y sin observar las obligaciones legales de información y consentimiento que correspondan.'),
        p('Cuando HAZLO CASH recabe directamente información de una persona recomendada, deberá poner a su disposición el aviso de privacidad correspondiente.'),
        p('La plataforma procurará implementar mecanismos de validación de recomendaciones que eviten solicitar información personal innecesaria.'),
      ],
    },
    {
      titulo: 'DÉCIMA QUINTA. MENORES DE EDAD',
      bloques: [
        p('Los servicios que impliquen generación de comisiones y celebración de relaciones contractuales estarán destinados a personas con capacidad legal suficiente.'),
        p('Cuando la participación de menores resulte legalmente admisible, HAZLO CASH deberá implementar mecanismos apropiados para obtener la intervención o autorización de quienes ejerzan la patria potestad o tutela, según corresponda.'),
      ],
    },
    {
      titulo: 'DÉCIMA SEXTA. MODIFICACIONES AL AVISO DE PRIVACIDAD',
      bloques: [
        p('HAZLO CASH podrá modificar el presente Aviso de Privacidad para atender reformas legales, cambios operativos, nuevas funcionalidades o modificaciones en sus prácticas de tratamiento de datos.'),
        p('Las modificaciones serán comunicadas mediante su publicación en: https://www.hazlocash.com'),
        p('Cuando la naturaleza de los cambios o las disposiciones legales aplicables lo requieran, se utilizarán mecanismos adicionales de comunicación y se solicitará nuevamente el consentimiento correspondiente.'),
      ],
    },
    {
      titulo: 'DÉCIMA SÉPTIMA. AUTORIDAD COMPETENTE Y PROTECCIÓN DE DERECHOS',
      bloques: [
        p('El titular podrá acudir ante la autoridad competente en materia de protección de datos personales en posesión de los particulares para ejercer los medios de defensa reconocidos por la legislación mexicana.'),
        p('Ninguna disposición del presente Aviso deberá interpretarse como una renuncia anticipada a los derechos reconocidos por la Constitución Política de los Estados Unidos Mexicanos y demás disposiciones aplicables.'),
      ],
    },
    {
      titulo: 'DÉCIMA OCTAVA. CONSENTIMIENTO Y ACEPTACIÓN',
      bloques: [
        p('HAZLO CASH pondrá el presente Aviso de Privacidad a disposición de los usuarios antes de recabar sus datos personales, mediante los mecanismos digitales o físicos correspondientes.'),
        p('Cuando la legislación permita el consentimiento tácito, éste se entenderá otorgado en los términos legalmente previstos.'),
        p('En los casos que requieran consentimiento expreso o expreso y por escrito, HAZLO CASH implementará mecanismos específicos para recabarlo y conservar evidencia de su otorgamiento.'),
        p('La aceptación de los términos y condiciones comerciales de la plataforma no sustituirá los consentimientos específicos exigidos por la legislación de protección de datos personales.'),
      ],
    },
    {
      titulo: 'DÉCIMA NOVENA. INFORMACIÓN DE CONTACTO',
      bloques: [
        p('Para dudas, aclaraciones, solicitudes relacionadas con el tratamiento de datos personales, revocación del consentimiento o ejercicio de derechos ARCO, los usuarios podrán comunicarse mediante los siguientes datos:'),
        lista(
          'Razón social: HAZLO CASH, S.A. de C.V.',
          'Domicilio: Calle Hidalgo número 212, colonia Gil y Sáenz, Villahermosa, Tabasco, México, C. P. 86080.',
          'Sitio web: https://www.hazlocash.com',
          `Correo electrónico de privacidad: ${CORREO_PRIVACIDAD}`,
        ),
        p('Fecha de última actualización: 8 de octubre 2026'),
        p('HAZLO CASH S.A. DE C.V.'),
      ],
    },
  ],
};

const CONTRATO_RECOMENDADORES: DocumentoLegal = {
  slug: 'recomendadores',
  titulo: 'Contrato de Prestación de Servicios de Recomendación',
  corto: 'Contrato de recomendador',
  resumen: 'Términos y condiciones para influencers o recomendadores: cómo se generan y pagan tus comisiones.',
  version: '2026-10-23',
  actualizado: '23 de octubre de 2026',
  secciones: [
    {
      bloques: [
        p('Términos y condiciones para influencers o recomendadores'),
        p('Celebran este contrato HAZLO CASH, S.A. DE C.V. (en adelante, “HAZLO CASH”) y la persona física que se registra y acepta sus términos (en adelante, “EL RECOMENDADOR” o “EL INFLUENCER”). Ambas se denominarán conjuntamente “LAS PARTES”.'),
      ],
    },
    {
      titulo: 'DECLARACIONES',
      bloques: [
        p('I. EL RECOMENDADOR declara que es mayor de edad, cuenta con capacidad legal para contratar y, cuando corresponda, con autorización para realizar actividades independientes en México; que sus datos de registro son verdaderos y se mantendrán actualizados; y que cumplirá sus obligaciones fiscales. Declara su intención de recomendar los negocios, productos o servicios publicados en las plataformas de HAZLO CASH.'),
        p('II. HAZLO CASH declara que cuenta con facultades para celebrar este contrato y con recursos para operar su plataforma de recomendaciones y coordinar las actividades aquí descritas.'),
      ],
    },
    {
      titulo: 'PRIMERA. DEFINICIONES',
      bloques: [
        p('Recomendador o influencer: persona que da a conocer productos, negocios o servicios a terceros por sus medios y contactos. Recomendado: persona que llega a un negocio por esa recomendación. Comisión o remuneración: importe que corresponde al recomendador por una operación válida y confirmada. Código personal o QR: identificador utilizado por la plataforma para relacionar una recomendación con su autor. Plataforma: sitio web, aplicación o medio digital oficial de HAZLO CASH.'),
      ],
    },
    {
      titulo: 'SEGUNDA. OBJETO',
      bloques: [
        p('EL RECOMENDADOR difundirá, de manera independiente y por los medios que elija, los negocios, productos o servicios publicados en las plataformas de HAZLO CASH. Su participación podrá generar una comisión cuando la operación cumpla las condiciones de la promoción y sea validada por el negocio conforme al procedimiento de la plataforma.'),
      ],
    },
    {
      titulo: 'TERCERA. COMISIONES Y PAGOS',
      bloques: [
        p('Las comisiones que recibirá EL INFLUENCER O RECOMENDADOR serán variables y dependerán del producto o servicio recomendado, así como de las condiciones comerciales previamente acordadas entre HAZLO CASH, S.A. DE C.V. y cada negocio participante. HAZLO CASH se compromete a publicar de manera clara, precisa y accesible, dentro de su plataforma, el monto o porcentaje de comisión correspondiente a cada negocio, producto o servicio, así como los beneficios, requisitos y condiciones aplicables, con la finalidad de que EL INFLUENCER O RECOMENDADOR conozca anticipadamente cuánto puede ganar por cada recomendación exitosa.'),
        p('La comisión se generará únicamente cuando el negocio confirme y valide, a través de la plataforma HAZLO CASH, que la persona recomendada realizó efectivamente la compra de un producto o el pago de un servicio, por lo tanto, la simple visita al establecimiento, sin que exista una operación de compra o contratación debidamente confirmada, no dará derecho a recibir comisión alguna.'),
        p('Una vez validada la operación, HAZLO CASH notificará a EL INFLUENCER O RECOMENDADOR y acreditará la comisión correspondiente en su billetera electrónica o wallet virtual, donde podrá consultar de manera transparente el importe generado y su saldo disponible. EL INFLUENCER O RECOMENDADOR podrá solicitar el retiro de las comisiones disponibles en su wallet virtual. HAZLO CASH deberá efectuar el pago correspondiente dentro de un plazo máximo de dos (2) días hábiles, contados a partir de la solicitud de retiro, siempre que se cumplan los requisitos de identificación, validación y pago establecidos en el presente contrato.'),
        p('Las cantidades que se paguen estarán sujetas a las retenciones de impuestos y demás contribuciones que legalmente correspondan, de conformidad con las disposiciones fiscales vigentes en los Estados Unidos Mexicanos. HAZLO CASH realizará únicamente las retenciones que resulten legalmente aplicables e informará a EL INFLUENCER O RECOMENDADOR el importe bruto de su comisión, las retenciones efectuadas y la cantidad neta que recibirá.'),
        p('Las partes reconocen que este mecanismo tiene como finalidad garantizar un sistema de remuneraciones claro, transparente y verificable, en el que cada recomendador conozca las condiciones para generar sus comisiones y pueda consultar los movimientos realizados en su wallet virtual.'),
      ],
    },
    {
      titulo: 'CUARTA. OBLIGACIONES DE HAZLO CASH',
      bloques: [
        p('HAZLO CASH administrará la plataforma, publicará las campañas de los negocios participantes, registrará las recomendaciones y gestionará las comisiones que procedan. Los fabricantes, vendedores y prestadores de servicios son responsables de la calidad, entrega, funcionamiento y garantías de lo que comercialicen, en los términos que marque la ley.'),
      ],
    },
    {
      titulo: 'QUINTA. OBLIGACIONES DEL RECOMENDADOR',
      bloques: [
        p('EL RECOMENDADOR se compromete a difundir las ofertas de forma veraz, respetar sus condiciones y no cobrar al recomendado por compartir una recomendación. No podrá presentarse como empleado, representante o apoderado de HAZLO CASH o de los negocios participantes, ni utilizar sus marcas o materiales fuera de las autorizaciones otorgadas. Deberá cumplir las normas aplicables a la publicidad y a la protección de consumidores.'),
      ],
    },
    {
      titulo: 'SEXTA. VIGENCIA Y TERMINACIÓN',
      bloques: [
        p('Este contrato entrará en vigor al aceptarse por firma o por registro electrónico y continuará mientras exista participación activa en la plataforma, salvo terminación anticipada comunicada por correo electrónico. Cualquiera de LAS PARTES podrá darlo por terminado. La terminación no elimina las obligaciones de pago que ya se hubieran generado y validado. No se concede exclusividad al recomendador.'),
        p('LAS PARTES reconocen que este acuerdo no crea, por sí mismo, sociedad, representación o relación laboral. La naturaleza real de la relación se determinará conforme a los hechos y a la legislación aplicable. Ninguna parte será responsable de incumplimientos causados directamente por hechos inevitables de caso fortuito o fuerza mayor, en los términos legales correspondientes.'),
      ],
    },
    {
      titulo: 'SÉPTIMA. CONFIDENCIALIDAD Y DATOS PERSONALES',
      bloques: [
        p('LAS PARTES protegerán la información confidencial que conozcan por este contrato y solo la utilizarán para cumplirlo. Podrán compartirla con asesores o proveedores que deban conocerla y estén obligados a mantenerla reservada, o cuando exista obligación legal. La confidencialidad comercial subsistirá por tres años después de la terminación; los datos personales permanecerán protegidos por el tiempo que exija la ley.'),
        p('HAZLO CASH tratará los datos personales de los recomendadores conforme a su aviso de privacidad y a la legislación mexicana aplicable. Cada parte implementará medidas de seguridad apropiadas, atenderá solicitudes y requerimientos de autoridad conforme a derecho y mantendrá actualizados los datos que proporcione. El registro en la plataforma y la aceptación de estos términos constituyen el mecanismo de adhesión, sin perjuicio de los requisitos legales aplicables.'),
      ],
    },
    {
      titulo: 'OCTAVA. DOMICILIOS Y NOTIFICACIONES',
      bloques: [
        p('Para efectos de avisos y notificaciones, EL RECOMENDADOR señala el domicilio y correo electrónico proporcionados en su registro. HAZLO CASH señala como domicilio: calle Hidalgo número 212, colonia Gil y Sáenz, Villahermosa, Tabasco, México. LAS PARTES deberán comunicar oportunamente cualquier cambio de domicilio o datos de contacto.'),
      ],
    },
    {
      titulo: 'NOVENA. LEGISLACIÓN Y JURISDICCIÓN',
      bloques: [
        p('Este contrato se interpretará conforme a las leyes mexicanas aplicables. Para controversias que legalmente admitan elección de jurisdicción, LAS PARTES se someten a los tribunales competentes de Villahermosa, Tabasco, sin perjuicio de los derechos irrenunciables que correspondan por ley.'),
      ],
    },
    {
      titulo: 'ACEPTACIÓN',
      bloques: [
        p('Al firmar o aceptar electrónicamente este documento, LAS PARTES manifiestan que lo han leído, comprendido y aceptado.'),
      ],
    },
  ],
};

const CONTRATO_NEGOCIOS: DocumentoLegal = {
  slug: 'negocios',
  titulo: 'Contrato de Prestación de Servicios de Promoción y Recomendaciones',
  corto: 'Contrato para negocios',
  resumen: 'Condiciones para publicar tu negocio: recarga de puntos, comisiones y obligaciones de cada parte.',
  version: '2026-10-23',
  actualizado: '23 de octubre de 2026',
  secciones: [
    {
      bloques: [
        p('Contrato que celebran HAZLO CASH, S.A. DE C.V. (en adelante, “HAZLO CASH”), por conducto de su representante legal debidamente facultado, y la persona física o moral identificada en el registro o carátula de contratación (el “CLIENTE”), conjuntamente las “Partes”, conforme a las declaraciones y cláusulas siguientes.'),
      ],
    },
    {
      titulo: 'DECLARACIONES',
      bloques: [
        p('I. Declara HAZLO CASH: a) ser una sociedad mercantil constituida conforme a las leyes mexicanas, cuyos datos de escritura constitutiva, RFC XXX y representación se harán constar en la carátula o expediente de contratación; b) operar una plataforma para difundir ofertas comerciales y facilitar recomendaciones de terceros independientes; c) señalar como domicilio para notificaciones Calle Hidalgo # 212, colonia Gil y Sáenz, C.P. 86080, Villahermosa, Tabasco, México, sujeto a corroboración con su documentación corporativa.'),
        p('II. Declara el CLIENTE: a) contar con capacidad jurídica y facultades para contratar; b) comercializar lícitamente los bienes o servicios ofrecidos y contar con permisos, licencias y autorizaciones exigibles; c) proporcionar información exacta, comprobable y actualizada; d) conocer y aceptar el esquema de cargos y comisiones expresamente indicado en este contrato y sus anexos.'),
        p('III. Las Partes manifiestan su voluntad de obligarse, ya sea mediante firma autógrafa o aceptación electrónica verificable, sin que exista relación de sociedad, agencia, mandato, franquicia, representación o subordinación laboral entre ellas.'),
      ],
    },
    {
      titulo: 'PRIMERA. DEFINICIONES',
      bloques: [
        p('“Plataforma”: sitio web y sistemas autorizados de HAZLO CASH. “Recomendador”: usuario independiente que refiere potenciales compradores. “Recomendado”: persona que recibe una referencia identificable. “Operación atribuible”: compra, contratación, arrendamiento o venta efectivamente realizada y pagada, vinculada mediante código, enlace u otro mecanismo verificable al recomendador. “Comisión”: contraprestación por operación atribuible, distinta del cargo periódico de publicación.'),
      ],
    },
    {
      titulo: 'SEGUNDA. OBJETO',
      bloques: [
        p('HAZLO CASH prestará al CLIENTE servicios de registro, exhibición y difusión de su oferta comercial en la Plataforma, así como herramientas de identificación y seguimiento de recomendaciones. Los recomendadores actuarán por cuenta propia y no podrán obligar a HAZLO CASH ni al CLIENTE. Salvo pacto escrito específico, HAZLO CASH no vende los bienes del CLIENTE, no recibe el precio de éstos ni garantiza ventas, tráfico, resultados, colocación o volumen de recomendaciones.'),
      ],
    },
    {
      titulo: 'TERCERA. ALTA Y PUBLICACIONES',
      bloques: [
        p('El CLIENTE entregará descripciones, precios, condiciones, imágenes y permisos de uso suficientes. HAZLO CASH podrá solicitar correcciones, rechazar o suspender contenidos ilícitos, engañosos o que vulneren derechos de terceros, con aviso y explicación cuando sea razonablemente posible. La publicación en redes sociales estará sujeta al plan efectivamente contratado, calendario y disponibilidad editorial; no se entenderá garantizada una frecuencia “permanente” sin especificación escrita.'),
      ],
    },
    {
      titulo: 'CUARTA. TARIFAS Y COMISIONES',
      bloques: [
        p('COMPRA, RECARGA Y UTILIZACIÓN DE PUNTOS O SALDO'),
        p('EL CLIENTE acepta que, para utilizar los servicios de promoción y recomendación de negocios, productos o servicios mediante influencers o recomendadores dentro de la plataforma HAZLO CASH, S.A. DE C.V., deberá adquirir previamente puntos o saldo, los cuales serán utilizados para cubrir las comisiones pactadas con HAZLO CASH.'),
        p('Para efectos del presente contrato, cada punto tendrá un valor equivalente a $1.00 (un peso 00/100 moneda nacional). Por lo tanto, el saldo disponible en la cuenta de EL CLIENTE corresponderá al número de puntos adquiridos y acreditados en la plataforma.'),
        p('EL CLIENTE se obliga a realizar una recarga mínima de $200.00 (doscientos pesos 00/100 M.N.), más el Impuesto al Valor Agregado (IVA) correspondiente del 16%, equivalente a $32.00 (treinta y dos pesos 00/100 M.N.), dando un total mínimo de $232.00 (doscientos treinta y dos pesos 00/100 M.N.) por semana. Dicha cantidad corresponderá a 200 puntos disponibles para su utilización, mientras que los $32.00 restantes corresponderán al IVA.'),
        p('Las recargas deberán realizarse mediante transferencia bancaria a la cuenta que HAZLO CASH designe y comunique a EL CLIENTE a través de su correo electrónico oficial y/o mediante el presente contrato.'),
        p('Una vez confirmado el pago, HAZLO CASH acreditará los puntos correspondientes en la cuenta de EL CLIENTE. Estos puntos se descontarán automáticamente conforme se generen las comisiones por las recomendaciones realizadas por los influencers o recomendadores, de acuerdo con el monto o porcentaje de comisión previamente pactado entre EL CLIENTE y HAZLO CASH.'),
        p('EL CLIENTE podrá consultar su saldo disponible y los descuentos realizados a través de los medios que HAZLO CASH habilite para tal efecto.'),
        p('Los puntos adquiridos únicamente podrán utilizarse dentro de la plataforma HAZLO CASH para cubrir las comisiones y servicios expresamente contratados, sin que representen dinero en efectivo ni puedan ser transferidos a terceros, salvo autorización expresa y por escrito de HAZLO CASH.'),
        p('Las partes reconocen y aceptan que el valor de los puntos, el importe mínimo de recarga y las comisiones aplicables serán los establecidos en el presente contrato y sus anexos, y que cualquier modificación deberá ser comunicada y aceptada conforme a los términos contractuales correspondientes.'),
        p('Para operaciones inmobiliarias, la aplicación de la tarifa será del 6% sobre la venta.'),
      ],
    },
    {
      titulo: 'QUINTA. OBLIGACIONES DEL CLIENTE',
      bloques: [
        p('Mantener vigentes precios y promociones publicados; respetar la oferta informada al consumidor; atender garantías, devoluciones, facturación y reclamaciones; no discriminar a recomendados ni elevar precios por provenir de la Plataforma; no inducir a ocultar códigos o eludir comisiones; informar oportunamente operaciones y conservar documentación comprobatoria conforme a los plazos legales aplicables. El CLIENTE responderá por la legalidad, seguridad, calidad, disponibilidad y entrega de sus bienes y servicios.'),
      ],
    },
    {
      titulo: 'SEXTA. OBLIGACIONES DE HAZLO CASH',
      bloques: [
        p('Habilitar razonablemente el acceso a las funcionalidades contratadas, mantener mecanismos de seguimiento de referencias, proporcionar información de saldo y atender aclaraciones. Podrá efectuar mantenimientos y suspensiones justificadas, procurando avisar cuando sea posible. No asumirá obligaciones de fabricante, vendedor o prestador final, sin perjuicio de su responsabilidad por incumplimientos propios, dolo, culpa o disposiciones imperativas.'),
      ],
    },
    {
      titulo: 'SEPTIMA. RECOMENDADORES Y BENEFICIOS',
      bloques: [
        p('La relación entre HAZLO CASH y cada recomendador se regirá por sus condiciones independientes. Cualquier distribución de comisiones entre HAZLO CASH y recomendadores deberá estar descrita en las condiciones correspondientes; este contrato fija únicamente lo que paga el CLIENTE. Los descuentos o beneficios al recomendado sólo serán exigibles si constan expresamente en la oferta publicada y autorizada por el CLIENTE.'),
      ],
    },
    {
      titulo: 'OCTAVA. VIGENCIA Y RENOVACIÓN',
      bloques: [
        p('La contratación inicial no tendrá vigencia ya que se rige por la compra de puntos o recarga de saldo y se renueva automaticamenta con cada compra de puntos o recarga de saldo.'),
      ],
    },
    {
      titulo: 'NOVENA. INCUMPLIMIENTO Y TERMINACIÓN',
      bloques: [
        p('Ante incumplimiento subsanable, la Parte afectada notificará por escrito y otorgará cinco días hábiles para corregirlo. Podrá rescindir sin ese plazo cuando exista fraude acreditable, actividad ilícita, uso indebido grave de datos, falsificación o daño grave e inminente. Cualquiera podrá terminar al vencimiento del periodo contratado. La terminación no extingue saldos, devoluciones, obligaciones de confidencialidad ni responsabilidades previamente nacidas. Los pagos por servicios ya efectivamente prestados no serán reembolsables, salvo incumplimiento imputable a HAZLO CASH o norma imperativa.'),
      ],
    },
    {
      titulo: 'DÉCIMA. RESPONSABILIDAD E INDEMNIDAD',
      bloques: [
        p('Cada Parte responderá por daños directos acreditados que cause por incumplimiento imputable. El CLIENTE mantendrá indemne a HAZLO CASH frente a reclamaciones de terceros originadas en contenido proporcionado por el CLIENTE, publicidad falsa, infracciones de propiedad intelectual, defectos de productos o incumplimientos regulatorios del CLIENTE, siempre que exista relación causal y se permita su participación razonable en la defensa. Ninguna cláusula excluye responsabilidad por dolo, culpa grave o derechos irrenunciables. No se garantiza resultado comercial.'),
      ],
    },
    {
      titulo: 'DÉCIMA PRIMERA. PROPIEDAD INTELECTUAL',
      bloques: [
        p('El CLIENTE conserva la titularidad de sus marcas y materiales y concede a HAZLO CASH licencia no exclusiva, gratuita y limitada a la vigencia para reproducirlos y comunicarlos exclusivamente con fines de ejecución del contrato. HAZLO CASH conserva sus marcas, software y plataforma. Terminada la relación, cesará el uso promocional de materiales del CLIENTE en plazo razonable, salvo conservación legal o técnica de evidencias.'),
      ],
    },
    {
      titulo: 'DÉCIMA SEGUNDA. CONFIDENCIALIDAD',
      bloques: [
        p('Las Partes protegerán información comercial, técnica, financiera y estratégica no pública recibida por razón del contrato y la usarán sólo para ejecutarlo. Se exceptúa información pública, conocida legítimamente, desarrollada independientemente o exigida por autoridad competente. Esta obligación continuará tres años tras la terminación; respecto de datos personales y secretos industriales subsistirá el tiempo que establezca la legislación aplicable.'),
      ],
    },
    {
      titulo: 'DÉCIMA PRIMERA. DATOS PERSONALES',
      bloques: [
        p(`Cada Parte cumplirá la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás normativa aplicable, según el papel que efectivamente desempeñe en cada tratamiento. HAZLO CASH pondrá a disposición su aviso de privacidad y canal ${CORREO_PRIVACIDAD}. Las Partes sólo compartirán datos necesarios, aplicarán medidas administrativas, físicas y técnicas adecuadas, atenderán derechos ARCO y notificarán incidentes conforme a la ley. Si una Parte actúa como encargada por cuenta de la otra, formalizarán instrucciones y condiciones de tratamiento por separado.`),
      ],
    },
    {
      titulo: 'DÉCIMA SEGUNDA. CONTRATACIÓN ELECTRÓNICA Y EVIDENCIA',
      bloques: [
        p('La aceptación mediante casilla no premarcada, firma electrónica u otro mecanismo que identifique al aceptante y vincule su consentimiento con una versión íntegra del contrato podrá constituir manifestación de voluntad conforme a la legislación aplicable. HAZLO CASH conservará, en la medida legalmente exigible, versión aceptada, fecha, hora, identificador, evidencias de consentimiento y comunicaciones; entregará copia accesible al CLIENTE. Ninguna disposición elimina el derecho a cuestionar autenticidad o integridad de la evidencia.'),
      ],
    },
    {
      titulo: 'DÉCIMA TERCERA. IMPUESTOS Y AUTONOMÍA',
      bloques: [
        p('Cada Parte cumplirá sus obligaciones fiscales, laborales y de seguridad social. Este contrato no genera relación laboral, representación, asociación o exclusividad. El CLIENTE podrá contratar otras plataformas y HAZLO CASH podrá prestar servicios a competidores, respetando la confidencialidad pactada.'),
      ],
    },
    {
      titulo: 'DÉCIMA CUARTA. FUERZA MAYOR',
      bloques: [
        p('Ninguna Parte será responsable por retrasos directamente causados por acontecimientos ajenos a su control razonable, debidamente acreditados, siempre que notifique oportunamente y mitigue sus efectos. Las obligaciones dinerarias ya devengadas no se extinguen por esta causa. Si el impedimento dura más de 30 días naturales, cualquiera podrá terminar sin penalidad por prestaciones futuras.'),
      ],
    },
    {
      titulo: 'DÉCIMA QUINTA. AVISOS',
      bloques: [
        p(`Los avisos se dirigirán a los correos y domicilios indicados en la carátula o registro. HAZLO CASH: Calle Hidalgo # 212, colonia Gil y Sáenz, C.P. 86080, Villahermosa, Tabasco; correo contractual: avisos@hazlocash.com . El correo ${CORREO_PRIVACIDAD} se reserva para asuntos de datos personales. Los cambios deberán notificarse por medio verificable.`),
      ],
    },
    {
      titulo: 'DÉCIMA SÉPTIMA. LEY APLICABLE Y JURISDICCIÓN',
      bloques: [
        p('El contrato se interpretará conforme a las leyes mexicanas aplicables. Para controversias mercantiles, las Partes se someten a los tribunales competentes de Villahermosa, Tabasco, en la medida en que tal sumisión sea legalmente válida y sin perjuicio de competencias o derechos inderogables de consumidores y autoridades.'),
      ],
    },
    {
      titulo: 'VIGÉSIMA OCTAVA. INTEGRIDAD Y PRELACIÓN',
      bloques: [
        p('Forman parte del contrato la carátula, el Anexo A de tarifas y reglas de atribución, y las ofertas aceptadas por escrito. En caso de contradicción prevalecerán: (1) condiciones particulares firmadas; (2) Anexo A; (3) este contrato. Toda modificación requerirá aceptación verificable de ambas Partes; la nulidad de una disposición no afectará las demás.'),
        p('Las partes están de acuerdo con el presente contrato, una aceptando que el negocio o producto se publique en la o las plataformas de Hazlo Cash y la otra al momento de recargar saldo o puntos teniendo como fecha la aceptación-'),
      ],
    },
  ],
};

export const DOCUMENTOS_LEGALES: DocumentoLegal[] = [AVISO_PRIVACIDAD, CONTRATO_RECOMENDADORES, CONTRATO_NEGOCIOS];

export function documentoLegal(slug: string | undefined): DocumentoLegal | undefined {
  return DOCUMENTOS_LEGALES.find((d) => d.slug === slug);
}

/** Lo que acepta un recomendador al crear su cuenta (se guarda en su usuario). */
export const ACEPTACION_REGISTRO = {
  contrato_recomendador: CONTRATO_RECOMENDADORES.version,
  aviso_privacidad: AVISO_PRIVACIDAD.version,
} as const;

/** Lo que acepta el dueño al registrar su negocio (se guarda en su usuario). */
export const ACEPTACION_NEGOCIO = {
  contrato_negocios: CONTRATO_NEGOCIOS.version,
  aviso_privacidad: AVISO_PRIVACIDAD.version,
} as const;
