# Kaisō Sushi España - Sistema Completo de Reservas

## Resumo do Projeto
Sistema completo de reservas para restaurante japonês premium em Córdoba, com design de luxo, suporte multilíngue e painel administrativo.

## Identidade Visual
- **Tema**: Dark Premium (#050608)
- **Cor Principal**: Ouro Metálico (#C9A24A)
- **Acento**: Vermelho Japonês (#D11B2A)
- **Tipografia**: Playfair Display (títulos) + Montserrat (corpo)
- **Selo**: "KAISŌ SIGNATURE STANDARD"
- **Logo**: Logo oficial Kaisō Sushi (círculo vermelho com bambu/bowl) em `/assets/logo-kaiso.png`
- **QR Code Delivery**: `/assets/qr-delivery.png` (10% desconto delivery)

## Arquitetura Técnica

### Backend (FastAPI + MongoDB)
- **server.py**: API REST completa com todas as regras de negócio
- **Database**: MongoDB para persistência
- **Email**: SMTP Gmail configurado (senha pendente de validação)

### Frontend (React + Tailwind CSS)
- **Landing Page**: Hero premium, Sobre, Carta, Delivery, Franquias, Footer
- **ReservationSystem**: Sistema completo de reservas em 5 etapas
- **AdminPanel**: Dashboard com login, estatísticas, gestão
- **Multilíngue**: ES/PT/EN com persistência localStorage

## Configurações do Restaurante

### Horários
| Dia | Almoço | Jantar |
|-----|--------|--------|
| Segunda | FECHADO | FECHADO |
| Ter-Qui | 12:30-14:30 | 19:30-22:00 |
| Sex-Dom | 12:30-15:00 | 19:30-22:00 |

### Regras de Negócio
- **Capacidade**: 30 pessoas/dia (configurável)
- **Max por reserva**: 12 pessoas
- **Slots**: Intervalos de 15 minutos
- **Desconto**: 10% Terça-Quinta
- **Degustação Premium**: €65,90/pessoa (Ter-Qui 19:00-21:00)

### Credenciais
- **Admin**: admin / reservas
- **SMTP**: grupokaiso@kaisosushiespanha.com

## Status de Implementação

### Completo ✅
- [x] Design premium dark + gold
- [x] Logo oficial Kaisō Sushi no header e footer
- [x] QR Code real na página de sucesso de reserva
- [x] Nomes em japonês nas seções importantes
- [x] Selo KAISŌ SIGNATURE STANDARD
- [x] Navegação completa com links dourados
- [x] Multilíngue ES/PT/EN com persistência
- [x] Sistema de reservas completo (email obrigatório)
- [x] Calendário com bloqueio de segundas
- [x] Slots de 15 minutos
- [x] Horários diferentes por dia
- [x] Desconto 10% Ter-Qui
- [x] Menu Degustação Premium
- [x] Botões WhatsApp dourados (não verdes) com ícone WA
- [x] Dois botões por item do menu (WhatsApp + link kaisosushi.es)
- [x] Menu focado em Bocadillos & Hambúrguesas (categoria padrão)
- [x] Fotos reais do menu (menuintegrado.com)
- [x] Fotos do salão como fundo fosco
- [x] Confirmação WhatsApp
- [x] Notificação por email (SMTP)
- [x] Painel Admin com login
- [x] Estatísticas em tempo real
- [x] Gestão de reservas
- [x] Dias bloqueados (blackout)
- [x] Exportação CSV
- [x] Configuração de capacidade
- [x] Footer sem links Emergent

## Testes
- **Backend**: 100%
- **Frontend**: 100%
- **Último teste**: iteration_4.json (25/02/2026)

## Próximos Passos
- [ ] Verificar envio de emails em produção (senha SMTP)
- [ ] Validar integração WhatsApp (formato da mensagem)
- [ ] Teste completo do painel admin (funcionalidades avançadas)
- [ ] Configurar domínio final

## Contatos
- **Restaurante**: +34 673 036 835
- **Email**: companykaiso@gmail.com
- **Grupo Kaisō**: grupokaiso@kaisosushiespanha.com
- **Endereço**: Av. de Barcelona, 19, 14010 Córdoba, España
