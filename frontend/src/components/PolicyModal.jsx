import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const POLICY_TEXT_ES = `POLÍTICA DE RESERVAS Y NO-SHOW — KAISŌ

Versión 2026-07-16

Esta política establece los términos y condiciones para realizar reservas en nuestro restaurante Kaisō. Al aceptar esta política, usted acepta cumplir con todos los términos descritos a continuación.

1. RESERVAS GRATUITAS Y LIMITADAS

Las reservas en Kaisō son completamente gratuitas. Sin embargo, las mesas disponibles son limitadas. Al hacer una reserva, se asigna una mesa exclusivamente para su grupo.

2. POLÍTICA DE CANCELACIÓN Y NO-SHOW

a) Cancelación con aviso previo: Si no puede asistir, solicite la cancelación de su reserva con al menos 24 horas de anticipación. Las cancelaciones sin aviso causan pérdida de disponibilidad para otros clientes.

b) No-show sin aviso: Se considera "no-show" cuando un cliente no asiste a su reserva y no avisa al restaurante con al menos 24 horas de anticipación. Esto impide que otras personas disfruten de la mesa reservada.

3. BLOQUEO DE CUENTA POR NO-SHOW

Aplicamos un sistema de bloqueo gradual para proteger la disponibilidad de nuestras mesas:

- Primera falta sin aviso: Su cuenta recibe un aviso. Puede realizar nuevas reservas, pero recomendamos que avise con anticipación en futuras reservas.

- Segunda falta sin aviso dentro de 12 meses: Su cuenta será bloqueada temporalmente por 6 meses. Durante este período, no podrá hacer nuevas reservas.

- Grupo de 4 o más personas con múltiples faltas: El bloqueo puede aplicarse inmediatamente por 6 meses, independientemente del historial anterior.

4. DESBLOQUEO DE CUENTA

Si su cuenta fue bloqueada por error, o desea que sea desbloqueada antes del período de 6 meses, puede contactarnos directamente a través de WhatsApp. Evaluaremos su caso y consideraremos el desbloqueo si es apropiado.

5. RESERVAS EN PERÍODOS PICO

Durante períodos de alta demanda, las cancelaciones y no-shows afectan significativamente la capacidad del restaurante de servir a otros clientes. Valoramos su comprensión y compromiso con esta política.

6. MODIFICACIÓN DE RESERVAS

Para modificar la hora, fecha o número de personas de su reserva, contacte al restaurante con al menos 24 horas de anticipación.

7. ACEPTACIÓN DE TÉRMINOS

Al hacer una reserva en Kaisō, usted:
- Acepta esta política de reservas y no-show
- Confirma que asistiría a su reserva
- Se compromete a cancelar con aviso previo si no puede asistir
- Entiende las consecuencias del no-show y el bloqueo de cuenta

8. CONTACTO

Para preguntas, cancelaciones o desbloqueos, contacte a Kaisō:
- WhatsApp: +34 673 036 835
- Disponibles en portugués, español e inglés

Gracias por su comprensión y por ser parte de la comunidad Kaisō.`;

export default function PolicyModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center overflow-y-auto p-4"
      onClick={handleBackdropClick}
      data-testid="policy-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      translate="no"
    >
      <div
        className="bg-kaiso-bg border border-kaiso-border w-full max-w-2xl my-4 relative"
        onClick={(e) => e.stopPropagation()}
        data-testid="policy-modal-content"
      >
        {/* Modal Header */}
        <div className="border-b border-kaiso-border p-6 flex items-center justify-between sticky top-0 bg-kaiso-bg">
          <h2
            id="policy-modal-title"
            className="font-serif text-2xl text-kaiso-gold"
          >
            Política de Reservas
          </h2>
          <button
            onClick={onClose}
            className="text-kaiso-muted hover:text-kaiso-text text-2xl p-2 transition-colors"
            aria-label="Cerrar política"
            data-testid="policy-modal-close-x"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="p-6 max-h-[60vh] overflow-y-auto"
          data-testid="policy-modal-body"
        >
          <div className="text-kaiso-muted text-sm leading-relaxed whitespace-pre-wrap">
            {POLICY_TEXT_ES}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-kaiso-border p-6 bg-kaiso-card/50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full bg-kaiso-gold text-black py-3 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors"
            data-testid="policy-modal-close-button"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
