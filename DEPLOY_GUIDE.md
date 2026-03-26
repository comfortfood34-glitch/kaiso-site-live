# Guia de Deploy - Kaisō Sushi no Render

## Pré-requisitos
- Conta no [Render](https://render.com) (criada)
- Código salvo no GitHub (use o botão "Save to Github" no Emergent)

---

## Passo 1: Salvar no GitHub

No chat do Emergent, procure o botão **"Save to Github"** perto do campo de input.
Clique nele e conecte ao seu repositório GitHub.

---

## Passo 2: Criar Web Service no Render

1. No dashboard do Render, clique em **"New Web Service"**
2. Conecte o seu repositório GitHub
3. Selecione o repositório do Kaisō Sushi

---

## Passo 3: Configurar o Serviço

Na tela de configuração:

| Campo | Valor |
|-------|-------|
| **Name** | `kaiso-sushi` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` |
| **Runtime** | Docker |
| **Dockerfile Path** | `./Dockerfile` |
| **Plan** | Starter ($7/mês) ou Free |

---

## Passo 4: Variáveis de Ambiente

Clique em **"Advanced"** > **"Add Environment Variable"** e adicione:

| Variável | Valor |
|----------|-------|
| `MONGO_URL` | `mongodb+srv://leandrosilva0311_db_user:Z2gMZZWiocwU0yrn@cluster0.qdzhihd.mongodb.net/?appName=Cluster0` |
| `DB_NAME` | `kaiso_reservas` |
| `CORS_ORIGINS` | `*` |
| `ADMIN_USER` | `admin` |
| `ADMIN_PASSWORD` | `reservas` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `grupokaiso@kaisosushiespanha.com` |
| `SMTP_PASS` | `ztxfyfdmwcsadzkm` |
| `ADMIN_EMAIL_FROM` | `grupokaiso@kaisosushiespanha.com` |
| `NOTIFY_TO` | `companykaiso@gmail.com` |
| `CC_TO` | `grupokaiso@kaisosushiespanha.com` |

> **Nota:** O Render define a variável `PORT` automaticamente. Não precisa adicionar.

---

## Passo 5: Deploy

Clique em **"Create Web Service"**. O Render vai:
1. Clonar o repositório
2. Construir o Docker (instalar dependências + compilar frontend)
3. Iniciar o serviço

O primeiro deploy demora ~5-10 minutos.

---

## Passo 6: Verificar

Após o deploy, o Render fornece uma URL tipo:
```
https://kaiso-sushi.onrender.com
```

Teste:
- **Site:** `https://kaiso-sushi.onrender.com`
- **Admin:** `https://kaiso-sushi.onrender.com/admin`
- **API Health:** `https://kaiso-sushi.onrender.com/api/health`

---

## Passo 7: Domínio Personalizado (Opcional)

Se quiser usar `kaisosushicordoba.com`:

1. No Render, vá em **Settings** > **Custom Domains**
2. Adicione `kaisosushicordoba.com`
3. No seu registrador de domínio, configure:
   - **CNAME**: `kaisosushicordoba.com` → `kaiso-sushi.onrender.com`
   - Ou siga as instruções DNS que o Render mostrar

---

## Arquitectura no Render

```
[Internet] → [Render Web Service]
                  ├── Frontend React (arquivos estáticos)
                  ├── Backend FastAPI (/api/*)
                  └── WhatsApp Service (Node.js, iniciado automaticamente)
                        └── MongoDB Atlas (conexão externa)
```

Tudo roda num único container Docker. O FastAPI:
- Serve os arquivos do React (site)
- Processa as API requests (/api/*)
- Inicia o serviço WhatsApp automaticamente

---

## Troubleshooting

### Build falha
- Verifique os logs no Render dashboard
- Certifique-se que todas as variáveis de ambiente estão configuradas

### Site não carrega
- Aguarde 2-3 minutos após o deploy
- Verifique `/api/health` primeiro

### WhatsApp não conecta
- Acesse `/admin` → aba WhatsApp
- Escaneie o QR code novamente
- A sessão é salva no MongoDB e sobrevive reinícios

### Plano Free do Render
- O serviço "adormece" após 15 min sem tráfego
- Demora ~30 segundos para acordar
- Para produção, use o plano Starter ($7/mês) que não adormece
