# Kaisō Sushi España - Sistema Completo de Reservas

## Resumo do Projeto
Sistema completo de reservas para restaurante japonês premium em Córdoba, com design de luxo, suporte multilíngue e painel administrativo.

## Identidade Visual
- **Tema**: Dark Premium (#050608)
- **Cor Principal**: Ouro Metálico (#C9A24A)
- **Acento**: Vermelho Japonês (#D11B2A)
- **Tipografia**: Playfair Display (títulos) + Montserrat (corpo)
- **Selo**: "KAISŌ SIGNATURE STANDARD"

## Arquitetura Técnica

### Backend (FastAPI + MongoDB)
- **server.py**: API REST completa com todas as regras de negócio
- **Database**: MongoDB para persistência
- **Email**: SMTP Gmail configurado

### Frontend (React + Tailwind CSS)
- **Landing Page**: Hero premium, Carta, Delivery, Franquias, Footer
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

## Endpoints da API

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/config | Configuração pública |
| GET | /api/availability/{date} | Disponibilidade por data |
| POST | /api/reservations | Criar reserva |
| GET | /api/whatsapp-message | Gerar mensagem WhatsApp |

### Admin (requer autenticação)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/admin/reservations | Listar reservas |
| PATCH | /api/admin/reservations/{id} | Atualizar reserva |
| GET | /api/admin/stats | Estatísticas |
| POST | /api/admin/config | Atualizar configuração |
| POST | /api/admin/blackout | Adicionar data bloqueada |
| DELETE | /api/admin/blackout/{date} | Remover bloqueio |
| GET | /api/admin/blackout | Listar datas bloqueadas |
| GET | /api/admin/export | Exportar CSV |

## Status de Implementação ✅

### Completo
- [x] Design premium dark + gold
- [x] Selo KAISŌ SIGNATURE STANDARD
- [x] Navegação completa (7 seções)
- [x] Multilíngue ES/PT/EN com persistência
- [x] Sistema de reservas completo
- [x] Calendário com bloqueio de segundas
- [x] Slots de 15 minutos
- [x] Horários diferentes por dia
- [x] Desconto 10% Ter-Qui
- [x] Menu Degustação Premium
- [x] Confirmação WhatsApp
- [x] Notificação por email
- [x] Painel Admin com login
- [x] Estatísticas em tempo real
- [x] Gestão de reservas
- [x] Dias bloqueados (blackout)
- [x] Exportação CSV
- [x] Configuração de capacidade

## Testes
- **Backend**: 100% (18/18 testes)
- **Frontend**: 95%

## Deploy no Cloudflare
Para o build funcionar no Cloudflare Pages, adicione:
- **Build command**: `cd frontend && npm install && npm run build`
- **Build output directory**: `frontend/build`
- **Environment variable**: `CI=false`

## Histórico
- **24/02/2026**: Site reconstruído do zero com todas as funcionalidades
- **24/02/2026**: Testes 100% backend, 95% frontend

## Próximos Passos (P1)
- [ ] Substituir placeholders de imagem (/assets/...)
- [ ] Verificar envio de emails em produção
- [ ] Configurar domínio final

## Contatos
- **Restaurante**: +34 673 036 835
- **Email**: companykaiso@gmail.com
- **Grupo Kaisō**: grupokaiso@kaisosushiespanha.com
- **Endereço**: Av. de Barcelona, 19, 14010 Córdoba, España
