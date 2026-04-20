# 200 Racing – Site Completo

## Estrutura de Arquivos

```
200racing/
├── index.html          ← Página principal
├── loja.html           ← Catálogo de produtos (10 categorias)
├── login.html          ← Login/Cadastro (Google + e-mail)
├── admin.html          ← Painel do administrador
├── checkout.html       ← Carrinho + finalização de pedido
├── css/
│   └── global.css      ← Estilos compartilhados
├── js/
│   ├── firebase-config.js  ← Config Firebase + helpers
│   └── shared.js           ← Carrinho, toasts, auth UI
└── README.md
```

---

## ✅ PASSO A PASSO – COLOCAR O SITE NO AR

### 1. Criar projeto Firebase (GRATUITO)

1. Acesse: https://console.firebase.google.com
2. Clique em **"Criar projeto"** → nome: `200racing`
3. Desative o Google Analytics (opcional) → Criar

#### 1.1 Ativar Authentication
- Menu lateral → **Authentication** → **Começar**
- Aba **"Sign-in method"**
- Ative **Google** (preencha e-mail de suporte)
- Ative **E-mail/senha**

#### 1.2 Ativar Firestore Database
- Menu lateral → **Firestore Database** → **Criar banco de dados**
- Escolha **"Iniciar no modo de produção"**
- Selecione região: `southamerica-east1` (São Paulo)

#### 1.3 Regras de segurança do Firestore
Vá em **Firestore → Regras** e cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /orders/{id} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if true;
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### 1.4 Pegar as chaves do Firebase
- Ícone de engrenagem → **Configurações do projeto**
- Role para baixo → **Seus apps** → clique em **"</>** (Web)"
- Dê um nome (ex: "200racing-web") → Registrar app
- Copie o objeto `firebaseConfig`

#### 1.5 Colar as chaves no arquivo
Abra `js/firebase-config.js` e substitua:
```javascript
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};
```

---

### 2. Definir o primeiro administrador

1. Acesse o site e faça login com Google (sua conta)
2. No Firebase Console → **Firestore** → coleção `users`
3. Encontre seu documento (pelo seu UID)
4. Edite o campo `role` de `"customer"` para `"admin"`
5. Pronto — você verá o botão **ADM** no menu

---

### 3. Hospedar no Vercel (GRATUITO, recomendado)

1. Acesse: https://vercel.com → Criar conta grátis
2. Instale o Vercel CLI: `npm i -g vercel`
3. Na pasta do projeto, execute: `vercel`
4. Siga as instruções → site publicado!
5. Seu site estará em: `https://200racing.vercel.app`

**OU** simplesmente arraste a pasta para https://vercel.com/new

---

### 4. Domínio próprio (ex: 200racing.com.br)

- Registre em: https://registro.br (~R$ 40/ano)
- No Vercel → Settings → Domains → adicione seu domínio
- Configure o DNS conforme instruções do Vercel

---

### 5. Adicionar domínio no Firebase

No Firebase Console → Authentication → Settings → Domínios autorizados
→ Adicione seu domínio (ex: `200racing.vercel.app` ou `200racing.com.br`)

---

## 💳 INTEGRAÇÃO DE PAGAMENTO (quando decidir)

O checkout já está estruturado para receber um gateway.
Quando escolher, abra `checkout.html` e na função `placeOrder()`,
após criar o pedido no Firebase, adicione a chamada ao gateway:

### Mercado Pago (recomendado para Brasil)
```javascript
// Adicionar no <head>:
// <script src="https://sdk.mercadopago.com/js/v2"></script>

const mp = new MercadoPago('SUA_PUBLIC_KEY');
const bricksBuilder = mp.bricks();
// ... configurar brick de pagamento
```
Documentação: https://www.mercadopago.com.br/developers/pt/docs

### PagSeguro
Documentação: https://dev.pagseguro.uol.com.br

---

## 🛒 GERENCIAR PRODUTOS (Painel Admin)

1. Acesse `seusite.com/admin.html`
2. Faça login com sua conta de administrador
3. Clique em **"Produtos"** no menu lateral
4. Use **"+ Novo Produto"** para adicionar
5. Clique em **"Editar"** para alterar preço, nome, descrição, imagem
6. Clique em **"Excluir"** para remover

> Os produtos aparecem automaticamente na loja para todos os clientes!

---

## 📱 WHATSAPP

Chave configurada: `5562998646666`
Para alterar, busque por `5562998646666` em todos os arquivos HTML.

---

## 🔑 RESUMO DO SISTEMA

| Funcionalidade | Tecnologia | Custo |
|---|---|---|
| Hospedagem | Vercel | Grátis |
| Banco de dados | Firebase Firestore | Grátis (até 1GB) |
| Login Google | Firebase Auth | Grátis |
| Login e-mail/senha | Firebase Auth | Grátis |
| Carrinho | localStorage | Grátis |
| Pedidos | Firebase Firestore | Grátis |
| Pagamento | A definir | Taxa por transação |
| Domínio .com.br | registro.br | ~R$ 40/ano |
